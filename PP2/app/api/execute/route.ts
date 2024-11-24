import { NextRequest, NextResponse } from 'next/server';
import Docker from 'dockerode';
import crypto from 'crypto';
import tar from 'tar-stream';

interface CodeRequest {
    language: 'python' | 'java' | 'cpp' | 'c' | 'javascript' | 'typescript' | 'go' | 'ruby' | 'php' | 'kotlin';
    code: string;
    input: string;
}

interface CodeResponse {
    output?: string;
    error?: string;
}

interface LanguageConfig {
    extension: string;
    compile: boolean;
    compileCommand?: (filename: string) => string;
    runCommand: (filename: string) => string;
    processCode?: (code: string, filename: string) => string;
    getFilename?: (randomId: string) => string;
    setupCommands?: string[];
    poolSize: number;
}

interface ContainerInfo {
    container: Docker.Container;
    busy: boolean;
    language: string;
    lastUsed: number;
}

// Language configurations using the original code-runner image
const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
    python: {
        extension: 'py',
        compile: false,
        runCommand: (filename: string) => `python3 ${filename}`,
        poolSize: 1
    },
    javascript: {
        extension: 'js',
        compile: false,
        runCommand: (filename: string) => `node ${filename}`,
        processCode: (code: string) => {
            // Add input handling wrapper
            return `
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let inputLines = [];
let currentLine = 0;

readline.on('line', (line) => {
    inputLines.push(line);
});

readline.on('close', () => {
    main();
});

function readLine() {
    return inputLines[currentLine++];
}

async function main() {
    ${code}
}
`;
        },
        poolSize: 1
    },
    java: {
        extension: 'java',
        compile: true,
        compileCommand: (filename: string) => `javac ${filename}`,
        runCommand: (filename: string) => `java -cp . ${filename.replace('.java', '')}`,
        processCode: (code: string, filename: string) => {
            const className = filename.replace('.java', '');
            if (code.includes('class')) {
                return code.replace(/public\s+class\s+\w+/, `public class ${className}`);
            }
            return `
public class ${className} {
    public static void main(String[] args) {
        ${code}
    }
}`;
        },
        getFilename: (randomId: string) => `Main${randomId}.java`,
        setupCommands: ['mkdir -p /app/workspace'],
        poolSize: 1
    },
    cpp: {
        extension: 'cpp',
        compile: true,
        compileCommand: (filename: string) => `g++ -o ${filename}.out ${filename}`,
        runCommand: (filename: string) => `./${filename}.out`,
        processCode: (code: string, filename: string) => {
            let processedCode = code;
            if (!code.includes('#include')) {
                processedCode = `#include <iostream>\n#include <string>\nusing namespace std;\n${code}`;
            }
            if (!code.includes('main(')) {
                processedCode = `
#include <iostream>
#include <string>
using namespace std;

int main() {
    ${code}
    return 0;
}`;
            }
            return processedCode;
        },
        poolSize: 1
    },
    c: {
        extension: 'c',
        compile: true,
        compileCommand: (filename: string) => `gcc -o ${filename}.out ${filename}`,
        runCommand: (filename: string) => `./${filename}.out`,
        processCode: (code: string, filename: string) => {
            let processedCode = code;
            if (!code.includes('#include')) {
                processedCode = `#include <stdio.h>\n#include <stdlib.h>\n${code}`;
            }
            if (!code.includes('main(')) {
                processedCode = `
#include <stdio.h>
#include <stdlib.h>

int main() {
    ${code}
    return 0;
}`;
            }
            return processedCode;
        },
        poolSize: 1
    },
    typescript: {
        extension: 'ts',
        compile: false,
        runCommand: (filename: string) =>
            `ts-node --transpile-only --compilerOptions '{"target":"ES2020","module":"CommonJS"}' ${filename}`,
        processCode: (code: string) => {
            // Add input handling wrapper
            return `
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let inputLines: string[] = [];
let currentLine = 0;

function readLine(): string {
    return inputLines[currentLine++];
}

async function main() {
    ${code}
}

rl.on('line', (line) => {
    inputLines.push(line);
});

rl.on('close', () => {
    main();
});
`;
        },
        setupCommands: ['mkdir -p /app/workspace'],
        poolSize: 1
    },
    go: {
        extension: 'go',
        compile: true,
        compileCommand: (filename: string) => `go build -o ${filename}.out ${filename}`,
        runCommand: (filename: string) => `./${filename}.out`,
        processCode: (code: string, filename: string) => {
            if (!code.includes('package main')) {
                return `
package main

import "fmt"

func main() {
    ${code}
}`;
            }
            return code;
        },
        setupCommands: ['mkdir -p /app/workspace'],
        poolSize: 1
    },
    ruby: {
        extension: 'rb',
        compile: false,
        runCommand: (filename: string) => `ruby ${filename}`,
        poolSize: 1
    },
    php: {
        extension: 'php',
        compile: false,
        runCommand: (filename: string) => `php ${filename}`,
        poolSize: 1
    },
    kotlin: {
        extension: 'kt',
        compile: true,
        compileCommand: (filename: string) => `kotlinc ${filename} -include-runtime -d ${filename}.jar`,
        runCommand: (filename: string) => `java -jar ${filename}.jar`,
        processCode: (code: string, filename: string) => {
            if (!code.includes('fun main')) {
                return `
fun main() {
    ${code}
}`;
            }
            return code;
        },
        setupCommands: ['mkdir -p /app/workspace'],
        poolSize: 1
    }
};

class ContainerPool {
    private pools: Map<string, ContainerInfo[]> = new Map();
    private docker: Docker;
    private initialized = false;

    constructor() {
        this.docker = new Docker();
    }

    async initialize() {
        if (this.initialized) return;

        // Clean up any existing containers first
        const containers = await this.docker.listContainers({
            all: true,
            filters: { name: ['code-runner-'] }
        });

        for (const containerInfo of containers) {
            try {
                const container = this.docker.getContainer(containerInfo.Id);
                await container.remove({ force: true });
                console.log(`Cleaned up old container ${containerInfo.Names[0]}`);
            } catch (err) {
                console.error('Failed to cleanup container:', err);
            }
        }

        // Initialize empty pools for each language
        for (const language of Object.keys(LANGUAGE_CONFIG)) {
            this.pools.set(language, []);
        }

        this.initialized = true;
        this.startMaintenanceLoop();
    }

    private startMaintenanceLoop() {
        setInterval(async () => {
            await this.performMaintenance();
        }, 60000); // Check every minute
    }

    private async performMaintenance() {
        const now = Date.now();
        // @ts-ignore
        for (const [language, pool] of this.pools.entries()) {
            const remainingContainers = [];

            for (const containerInfo of pool) {
                // If container is idle for more than 5 minutes
                if (!containerInfo.busy && (now - containerInfo.lastUsed > 300000)) {
                    try {
                        await containerInfo.container.remove({ force: true });
                        console.log(`Removed idle container for ${language}`);
                    } catch (error) {
                        console.error(`Failed to remove idle container:`, error);
                    }
                } else {
                    remainingContainers.push(containerInfo);
                }
            }

            // Update pool with only active containers
            this.pools.set(language, remainingContainers);
        }
    }

    async getContainer(language: string): Promise<ContainerInfo | null> {
        const pool = this.pools.get(language);
        if (!pool) return null;

        // Try to find an available container
        let containerInfo = pool.find(c => !c.busy);

        // If no available container, create a new one
        if (!containerInfo) {
            const config = LANGUAGE_CONFIG[language];
            if (pool.length >= config.poolSize) {
                return null; // Pool size limit reached
            }

            // Create new container
            try {
                const container = await this.createContainer(language);
                await container.start();

                // Run setup commands if any
                if (config.setupCommands) {
                    for (const cmd of config.setupCommands) {
                        await executeCommand(container, cmd);
                    }
                }

                containerInfo = {
                    container,
                    busy: false,
                    language,
                    lastUsed: Date.now()
                };
                pool.push(containerInfo);
            } catch (error) {
                console.error(`Failed to create container for ${language}:`, error);
                return null;
            }
        }

        containerInfo.busy = true;
        containerInfo.lastUsed = Date.now();
        return containerInfo;
    }

    releaseContainer(containerInfo: ContainerInfo) {
        containerInfo.busy = false;
        containerInfo.lastUsed = Date.now();
    }

    private async createContainer(language: string): Promise<Docker.Container> {
        return await this.docker.createContainer({
            Image: 'code-runner:latest',
            name: `code-runner-${language}-${crypto.randomBytes(4).toString('hex')}`,
            WorkingDir: '/app/workspace',
            Tty: true,
            OpenStdin: true,
            HostConfig: {
                Memory: 256 * 1024 * 1024,
                NanoCpus: 2000000000,
                PidsLimit: 10000,
                AutoRemove: true, // Changed to true to auto-remove stopped containers
                NetworkMode: 'none'
            },
            Cmd: ['/bin/bash']
        });
    }
}

const containerPool = new ContainerPool();

// Helper function to create a tar archive from code
async function createCodeTar(code: string, filename: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const pack = tar.pack();
        pack.entry({ name: filename }, code);
        pack.finalize();

        const chunks: Buffer[] = [];
        pack.on('data', (chunk) => chunks.push(chunk));
        pack.on('end', () => resolve(Buffer.concat(chunks)));
        pack.on('error', reject);
    });
}
async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => {
            // Skip the first 8 bytes of each chunk (Docker stream header)
            // But only if the chunk is large enough
            if (chunk.length > 8) {
                chunks.push(chunk.slice(8));
            } else {
                chunks.push(chunk);
            }
        });
        stream.on('error', reject);
        stream.on('end', () => {
            const result = Buffer.concat(chunks)
                .toString('utf8')
                // Remove all control characters except newlines
                .replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '')
                // Remove any leading/trailing whitespace
                .trim();
            resolve(result);
        });
    });
}


// Helper function to execute command in container and get output
async function executeCommand(
    container: Docker.Container,
    command: string,
    input?: string
): Promise<{ success: boolean; output: string }> {
    const exec = await container.exec({
        Cmd: ['/bin/bash', '-c', command],
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: !!input,
        Tty: false
    });

    const stream = await exec.start({ hijack: true, stdin: !!input });

    if (input) {
        stream.write(input);
        stream.end();
    }

    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(new Error('Execution timeout'));
        }, 10000); // 10 second timeout
    });

    try {
        // Race between stream reading and timeout
        const output = await Promise.race([
            streamToString(stream),
            timeoutPromise
        ]);

        const { ExitCode } = await exec.inspect();

        // If we get here, the command completed successfully
        return {
            success: ExitCode === 0,
            output: output.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '').trim()
        };
    } catch (error) {
        if ((error as Error).message === 'Execution timeout') {
            // Kill the running process if it timed out
            try {
                const killExec = await container.exec({
                    Cmd: ['pkill', '-9', '-f', command],
                    AttachStdout: true,
                    AttachStderr: true
                });
                // @ts-ignore
                await killExec.start();
            } catch (killError) {
                console.error('Error killing process:', killError);
            }

            throw new Error('Code execution timed out (possible infinite loop detected)');
        }
        throw error;
    }
}

export async function POST(req: NextRequest): Promise<NextResponse<CodeResponse>> {
    // @ts-ignore
    if (!containerPool.initialized) {
        await containerPool.initialize();
    }

    let containerInfo: ContainerInfo | null = null;

    try {
        const { language, code, input }: CodeRequest = await req.json();

        if (!LANGUAGE_CONFIG[language]) {
            return NextResponse.json(
                { error: 'Unsupported language' },
                { status: 400 }
            );
        }

        containerInfo = await containerPool.getContainer(language);
        if (!containerInfo) {
            return NextResponse.json(
                { error: 'No available containers' },
                { status: 503 }
            );
        }

        const config = LANGUAGE_CONFIG[language];
        const randomId = crypto.randomBytes(4).toString('hex');
        const filename = config.getFilename
            ? config.getFilename(randomId)
            : `main${randomId}.${config.extension}`;

        const processedCode = config.processCode
            ? config.processCode(code, filename)
            : code;

        // Create and upload code file
        const tarBuffer = await createCodeTar(processedCode, filename);
        await containerInfo.container.putArchive(tarBuffer, { path: '/app/workspace' });

        // Compile if needed
        if (config.compile && config.compileCommand) {
            const { success: compileSuccess, output: compileOutput } = await executeCommand(
                containerInfo.container,
                config.compileCommand(filename)
            );

            if (!compileSuccess) {
                throw new Error(`Compilation failed: ${compileOutput}`);
            }
        }

        try {
            // Run the code with built-in timeout handling
            const { output: runOutput } = await executeCommand(
                containerInfo.container,
                config.runCommand(filename),
                input
            );

            return NextResponse.json({ output: runOutput });
        } finally {
            // Clean up workspace regardless of execution outcome
            try {
                await executeCommand(containerInfo.container, 'rm -rf /app/workspace/*');
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }
        }
    } catch (error) {
        const errorMessage = (error as Error).message;
        const statusCode = errorMessage.includes('timeout') ? 408 : 400;

        return NextResponse.json(
            { error: `Execution error: ${errorMessage}` },
            { status: statusCode }
        );
    } finally {
        if (containerInfo) {
            try {
                // Ensure we kill any hanging processes before releasing the container
                await executeCommand(containerInfo.container, 'pkill -9 -f main');
                containerPool.releaseContainer(containerInfo);
            } catch (error) {
                console.error('Error in cleanup:', error);
            }
        }
    }
}
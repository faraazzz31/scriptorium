// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';
import { exec, ExecException } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Type definitions
interface CompilerRequest {
    code: string;
    input: string;
}

interface CompilerResponse {
    output?: string;
    error?: string;
}

interface ExecResult {
    stdout: string;
    stderr: string;
}

const execAsync = promisify(exec);

export async function POST(req: NextRequest): Promise<NextResponse<CompilerResponse>> {
    try {
        const { code, input }: CompilerRequest = await req.json();

        // Extract the class name from the code
        const classNameMatch: RegExpMatchArray | null = code.match(/class\s+(\w+)/);
        if (!classNameMatch) {
            return NextResponse.json(
                { error: "No valid Java class found in the code." },
                { status: 400 }
            );
        }
        const className: string = classNameMatch[1];

        // Create a temporary directory
        const tempDir: string = path.join('/tmp', 'javarun_' + Math.random().toString(36).substr(2, 9));
        await fs.mkdir(tempDir, { recursive: true });

        // Write the Java code to a file
        const filePath: string = path.join(tempDir, `${className}.java`);
        await fs.writeFile(filePath, code);

        try {
            // Compile the Java code
            const compileCommand: string = `javac ${filePath}`;
            const { stderr: compileError }: ExecResult = await execAsync(compileCommand);

            if (compileError) {
                return NextResponse.json(
                    { error: compileError },
                    { status: 400 }
                );
            }

            // Run the Java code with input
            const runCommand: string = `echo "${input}" | java -cp ${tempDir} ${className}`;
            const { stdout, stderr }: ExecResult = await execAsync(runCommand);

            if (stderr) {
                return NextResponse.json(
                    { error: stderr },
                    { status: 400 }
                );
            }

            return NextResponse.json({ output: stdout });
        } catch (execError) {
            console.error('Execution error:', execError);
            return NextResponse.json(
                { error: (execError as ExecException).message },
            { status: 400 }
        );
        } finally {
            // Clean up
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
                // Don't return here as the main operation might have succeeded
            }
        }
    } catch (error) {
        console.error('Error running Java code:', error);
        return NextResponse.json(
            { error: (error as Error).message },
        { status: 500 }
    );
    }
}
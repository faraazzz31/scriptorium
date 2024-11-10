// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';
import { exec, ExecException } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Type definitions
interface RunnerRequest {
    code: string;
    input: string;
}

interface RunnerResponse {
    output?: string;
    error?: string;
}

interface ExecResult {
    stdout: string;
    stderr: string;
}

const execAsync = promisify(exec);

export async function POST(req: NextRequest): Promise<NextResponse<RunnerResponse>> {
    try {
        const { code, input }: RunnerRequest = await req.json();

        // Create a temporary directory
        const tempDir: string = path.join('/tmp', 'jsrun_' + Math.random().toString(36).substr(2, 9));
        await fs.mkdir(tempDir, { recursive: true });

        // Write the JavaScript code to a file
        const filePath: string = path.join(tempDir, 'script.js');
        await fs.writeFile(filePath, code);

        try {
            // Run the JavaScript code with input
            const command: string = `echo "${input}" | node ${filePath}`;
            const { stdout, stderr }: ExecResult = await execAsync(command);

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
        console.error('Error running JavaScript code:', error);
        return NextResponse.json(
            { error: (error as Error).message },
        { status: 500 }
    );
    }
}
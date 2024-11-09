// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';
import { exec, ExecException } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

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
    const filename: string = crypto.randomBytes(16).toString('hex');
    const cFilePath: string = path.join('/tmp', `${filename}.c`);
    const exeFilePath: string = path.join('/tmp', filename);

    try {
        const { code, input }: CompilerRequest = await req.json();

        // Write the C code to a file
        await fs.writeFile(cFilePath, code);

        // Compile the C code
        try {
            const { stderr: compileError }: ExecResult = await execAsync(`gcc ${cFilePath} -o ${exeFilePath}`);
            if (compileError) {
                console.error('C Compilation Error:', compileError);
                return NextResponse.json(
                    { error: `Compilation error: ${compileError}` },
                    { status: 400 }
                );
            }
        } catch (compileError) {
            console.error('C Compilation Error:', compileError);
            return NextResponse.json(
                { error: `Compilation error: ${(compileError as ExecException).message}` },
                { status: 400 }
            );
        }

        // Run the compiled program with input
        try {
            const { stdout, stderr }: ExecResult = await execAsync(`echo "${input}" | ${exeFilePath}`);
            if (stderr) {
                console.error('C Runtime Error:', stderr);
                return NextResponse.json(
                    { error: `Runtime error: ${stderr}` },
                    { status: 400 }
                );
            }
            return NextResponse.json({ output: stdout });
        } catch (runtimeError) {
            console.error('C Runtime Error:', runtimeError);
            return NextResponse.json(
                { error: `Runtime error: ${(runtimeError as ExecException).message}` },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Unexpected error in C runner:', error);
        return NextResponse.json(
            { error: `Unexpected error: ${(error as Error).message}` },
            { status: 500 }
        );
    } finally {
        // Clean up temporary files
        try {
            await fs.unlink(cFilePath);
            await fs.unlink(exeFilePath);
        } catch (error) {
            console.error(`Error deleting temporary files: ${(error as Error).message}`);
        }
    }
}
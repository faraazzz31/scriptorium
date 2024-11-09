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

interface PythonCommandResult extends Partial<ExecResult> {
    error?: string;
}

// List of Python error types to catch
const PYTHON_ERRORS = [
    'SyntaxError',
    'IndentationError',
    'NameError',
    'TypeError',
    'ValueError',
    'AttributeError',
    'ImportError',
    'IndexError',
    'KeyError',
    'ZeroDivisionError',
    'RecursionError'
] as const;

type PythonErrorType = typeof PYTHON_ERRORS[number];

const execAsync = promisify(exec);

async function tryPythonCommands(filePath: string, input: string): Promise<PythonCommandResult> {
    const commands: string[] = [
        'python',
        'python3',
        '/usr/bin/python',
        '/usr/bin/python3',
        '/usr/local/bin/python',
        '/usr/local/bin/python3'
    ];

    for (const command of commands) {
        try {
            const { stdout, stderr }: ExecResult = await execAsync(`echo "${input}" | ${command} ${filePath}`);
            return { stdout, stderr };
        } catch (error) {
            const errorMessage = (error as ExecException).message;
            if (PYTHON_ERRORS.some(errorType => errorMessage.includes(errorType)) ||
                errorMessage.includes('maximum recursion depth exceeded')) {
                return { error: extractPythonError(errorMessage) };
            }
            // Otherwise, continue to the next command
        }
    }

    // If all commands fail without a syntax error, return a generic error
    return {
        error: "Failed to execute Python. Please ensure Python is installed and in the system PATH."
    };
}

function extractPythonError(errorMessage: string): string {
    const lines: string[] = errorMessage.split('\n');
    const relevantLines: string[] = lines.filter(line =>
        line.includes('File') ||
        PYTHON_ERRORS.some(errorType => line.includes(errorType)) ||
        line.includes('maximum recursion depth exceeded') ||
        line.trim().startsWith('^')
    );
    return relevantLines.join('\n');
}

export async function POST(req: NextRequest): Promise<NextResponse<RunnerResponse>> {
    let tempDir: string = '';
    try {
        const { code, input }: RunnerRequest = await req.json();

        // Create a temporary directory
        tempDir = path.join('/tmp', 'pythonrun_' + Math.random().toString(36).substr(2, 9));
        await fs.mkdir(tempDir, { recursive: true });

        // Write the Python code to a file
        const filePath: string = path.join(tempDir, 'script.py');
        await fs.writeFile(filePath, code);

        // Try running the Python code with different commands
        const { stdout, stderr, error }: PythonCommandResult = await tryPythonCommands(filePath, input);

        if (error) {
            return NextResponse.json(
                { error },
                { status: 400 }
            );
        }

        if (stderr) {
            return NextResponse.json(
                { error: stderr },
                { status: 400 }
            );
        }

        return NextResponse.json({ output: stdout });
    } catch (error) {
        console.error('Error running Python code:', error);
        return NextResponse.json(
            { error: (error as Error).message },
        { status: 500 }
    );
    } finally {
        // Clean up
        if (tempDir) {
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.error('Error during cleanup:', cleanupError);
            }
        }
    }
}
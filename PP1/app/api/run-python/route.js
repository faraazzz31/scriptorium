import { NextResponse } from 'next/server';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

async function tryPythonCommands(filePath, input) {
    const commands = [
        'python',
        'python3',
        '/usr/bin/python',
        '/usr/bin/python3',
        '/usr/local/bin/python',
        '/usr/local/bin/python3'
    ];

    for (const command of commands) {
        try {
            const { stdout, stderr } = await execAsync(`echo "${input}" | ${command} ${filePath}`);
            return { stdout, stderr };
        } catch (error) {
            if (error.message.includes('SyntaxError') ||
                error.message.includes('IndentationError') ||
                error.message.includes('NameError') ||
                error.message.includes('TypeError') ||
                error.message.includes('ValueError') ||
                error.message.includes('AttributeError') ||
                error.message.includes('ImportError') ||
                error.message.includes('IndexError') ||
                error.message.includes('KeyError') ||
                error.message.includes('ZeroDivisionError') ||
                error.message.includes('RecursionError')) {
                return { error: extractPythonError(error.message) };
            }
            // Otherwise, continue to the next command
        }
    }

    // If all commands fail without a syntax error, return a generic error
    return { error: "Failed to execute Python. Please ensure Python is installed and in the system PATH." };
}

function extractPythonError(errorMessage) {
    const lines = errorMessage.split('\n');
    const relevantLines = lines.filter(line =>
        line.includes('File') ||
        line.includes('SyntaxError') ||
        line.includes('IndentationError') ||
        line.includes('NameError') ||
        line.includes('TypeError') ||
        line.includes('ValueError') ||
        line.includes('AttributeError') ||
        line.includes('ImportError') ||
        line.includes('IndexError') ||
        line.includes('KeyError') ||
        line.includes('ZeroDivisionError') ||
        line.includes('RecursionError') ||
        line.includes('maximum recursion depth exceeded') ||
        line.trim().startsWith('^')
    );
    return relevantLines.join('\n');
}

export async function POST(req) {
    let tempDir = '';
    try {
        const { code, input } = await req.json();

        // Create a temporary directory
        tempDir = path.join('/tmp', 'pythonrun_' + Math.random().toString(36).substr(2, 9));
        await fs.mkdir(tempDir, { recursive: true });

        // Write the Python code to a file
        const filePath = path.join(tempDir, 'script.py');
        await fs.writeFile(filePath, code);

        // Try running the Python code with different commands
        const { stdout, stderr, error } = await tryPythonCommands(filePath, input);

        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        if (stderr) {
            return NextResponse.json({ error: stderr }, { status: 400 });
        }

        return NextResponse.json({ output: stdout });
    } catch (error) {
        console.error('Error running Python code:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
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
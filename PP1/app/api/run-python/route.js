import { NextResponse } from 'next/server';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

async function runPythonCode(filePath, input) {
    try {
        const { stdout, stderr } = await execAsync(`python3 ${filePath}`, { input });
        return { output: stdout, error: stderr };
    } catch (error) {
        return { error: formatPythonError(error.message, await fs.readFile(filePath, 'utf-8')) };
    }
}

function formatPythonError(errorMessage, sourceCode) {
    const lines = errorMessage.split('\n');
    const errorLine = lines.find(line => line.includes('line'));
    if (errorLine) {
        const lineNumber = parseInt(errorLine.match(/line (\d+)/)[1]);
        const codeLines = sourceCode.split('\n');
        const relevantCode = codeLines.slice(Math.max(0, lineNumber - 2), lineNumber + 1).join('\n');
        return `${errorMessage}\n\nRelevant code:\n${relevantCode}`;
    }
    return errorMessage;
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

        // Run the Python code
        const { output, error } = await runPythonCode(filePath, input);

        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        return NextResponse.json({ output });
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
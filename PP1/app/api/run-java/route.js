import { NextResponse } from 'next/server';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req) {
    try {
        const { code, input } = await req.json();

        // Extract the class name from the code
        const classNameMatch = code.match(/class\s+(\w+)/);
        if (!classNameMatch) {
            return NextResponse.json({ error: "No valid Java class found in the code." }, { status: 400 });
        }
        const className = classNameMatch[1];

        // Create a temporary directory
        const tempDir = path.join('/tmp', 'javarun_' + Math.random().toString(36).substr(2, 9));
        await fs.mkdir(tempDir, { recursive: true });

        // Write the Java code to a file
        const filePath = path.join(tempDir, `${className}.java`);
        await fs.writeFile(filePath, code);

        // Compile the Java code
        const compileCommand = `javac ${filePath}`;
        const { stderr: compileError } = await execAsync(compileCommand);

        if (compileError) {
            return NextResponse.json({ error: compileError }, { status: 400 });
        }

        // Run the Java code with input
        const runCommand = `echo "${input}" | java -cp ${tempDir} ${className}`;
        const { stdout, stderr } = await execAsync(runCommand);

        // Clean up
        await fs.rm(tempDir, { recursive: true, force: true });

        if (stderr) {
            return NextResponse.json({ error: stderr }, { status: 400 });
        }

        return NextResponse.json({ output: stdout });
    } catch (error) {
        console.error('Error running Java code:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
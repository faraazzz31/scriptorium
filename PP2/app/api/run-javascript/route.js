// Used Github co-pilot to help me write this code

import { NextResponse } from 'next/server';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req) {
    try {
        const { code, input } = await req.json();

        // Create a temporary directory
        const tempDir = path.join('/tmp', 'jsrun_' + Math.random().toString(36).substr(2, 9));
        await fs.mkdir(tempDir, { recursive: true });

        // Write the JavaScript code to a file
        const filePath = path.join(tempDir, 'script.js');
        await fs.writeFile(filePath, code);

        // Run the JavaScript code with input
        const command = `echo "${input}" | node ${filePath}`;
        const { stdout, stderr } = await execAsync(command);

        // Clean up
        await fs.rm(tempDir, { recursive: true, force: true });

        if (stderr) {
            return NextResponse.json({ error: stderr }, { status: 400 });
        }

        return NextResponse.json({ output: stdout });
    } catch (error) {
        console.error('Error running JavaScript code:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
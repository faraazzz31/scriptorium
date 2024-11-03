// Used Github co-pilot to help me write this code

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

const prisma = new PrismaClient();

async function handler (req) {
    const user = req.user;
    console.log(`user: ${JSON.stringify(user)}`);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { title, explanation, code, language, tag_ids } = await req.json();
        console.log(`title: ${title}, code: ${code}, explanation: ${explanation}, tags: ${tag_ids}, language: ${language}`);

        if (!title || !code || !language) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const data = {
            title: title,
            code: code,
            language: language,
            explanation: explanation? explanation : '',
            author: {
                connect: {
                    id: user.id,
                },
            },
        }

        if (tag_ids && tag_ids.length > 0) {
            const tags = await prisma.tag.findMany({
                where: {
                    id: {
                        in: tag_ids,
                    },
                },
            });

            if (tags.length !== tag_ids.length) {
                return NextResponse.json({ error: 'Invalid tags' }, { status: 400 });
            }

            data.tags = {
                connect: tag_ids.map(tag_id => ({ id: tag_id })),
            };
        }

        const codeTemplate = await prisma.codeTemplate.create({
            data: data,
        });

        return NextResponse.json(
            {
                id: codeTemplate.id,
                title: codeTemplate.title,
                explanation: codeTemplate.explanation,
                code: codeTemplate.code,
                author: codeTemplate.author,
                tags: codeTemplate.tags,
            }
        );
    } catch (error) {
        console.error(`Error in /app/api/code_template/save: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const POST = withAuth(handler);

// Used Github co-pilot to help me write this code

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

const prisma = new PrismaClient();

async function handler (req) {
    const user = req.user;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { codeTemplateId, title, explanation, code, tag_ids } = await req.json();

        console.log(`codeTemplateId: ${codeTemplateId}, title: ${title}, code: ${code}, explanation: ${explanation}, tags: ${tag_ids}`);

        if (!codeTemplateId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const codeTemplate = await prisma.codeTemplate.findUnique({
            where: {
                id: parseInt(codeTemplateId),
            },
            include: {
                tags: true
            }
        });

        if (!codeTemplate) {
            return NextResponse.json({ error: 'Code template not found' }, { status: 404 });
        }

        if (codeTemplate.authorId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = {
            title: title ? title : codeTemplate.title,
            code: code ? code : codeTemplate.code,
            explanation: explanation? explanation : codeTemplate.explanation,
        }

        // Handle tags update
        if (tag_ids !== undefined) {
            // Only modify tags if tag_ids is provided
            if (tag_ids.length > 0) {
                // Connect new tags
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
                    set: [],  // First disconnect all existing tags
                    connect: tag_ids.map(tag_id => ({ id: tag_id })),
                };
            } else {
                // If tag_ids is an empty array, disconnect all tags
                data.tags = {
                    set: [],  // This will remove all tag connections
                };
            }
        }

        console.log(`data: ${JSON.stringify(data)}`);

        const updatedCodeTemplate = await prisma.codeTemplate.update({
            where: {
                id: parseInt(codeTemplateId),
            },
            data: data,
            include: {
                tags: true
            }
        });

        return NextResponse.json({
            id: updatedCodeTemplate.id,
            title: updatedCodeTemplate.title,
            explanation: updatedCodeTemplate.explanation,
            code: updatedCodeTemplate.code,
            tags: updatedCodeTemplate.tags
        });
    } catch (error) {
        console.error(`Error in /app/api/code_template/edit: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const PUT = withAuth(handler);
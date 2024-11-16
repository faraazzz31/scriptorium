// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma} from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

interface CodeTemplateEditRequest {
    codeTemplateId: string;
    title?: string;
    explanation?: string;
    language?: string;
    code?: string;
    tag_ids?: number[];
}

interface CodeTemplateEditResponse {
    id: number;
    title: string;
    explanation: string | null;
    language: string;
    code: string;
    tags: {
        id: number;
        name: string;
    }[];
}

const prisma = new PrismaClient();

async function handler (req: AuthenticatedRequest): Promise<NextResponse<CodeTemplateEditResponse | { error: string }>> {
    const user = req.user;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { codeTemplateId, title, language, explanation, code, tag_ids }: CodeTemplateEditRequest = await req.json();

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

        const data: Prisma.CodeTemplateCreateInput = {
            title: title ? title : codeTemplate.title,
            code: code ? code : codeTemplate.code,
            language: language ? language : codeTemplate.language,
            author: {
                connect: {
                    id: user.id
                }
            },
            explanation: explanation? explanation : codeTemplate.explanation,
        }

        // Handle tags update if tag_ids is provided
        if (tag_ids !== undefined) {
            // Verify all provided tags exist
            const existingTags = await prisma.tag.findMany({
                where: {
                    id: {
                        in: tag_ids
                    }
                }
            });

            if (existingTags.length !== tag_ids.length) {
                return NextResponse.json({ error: 'One or more tags do not exist' }, { status: 400 });
            }

            // Update tags using set to replace all existing tags
            await prisma.codeTemplate.update({
                where: {
                    id: parseInt(codeTemplateId)
                },
                data: {
                    tags: {
                        set: tag_ids.map(id => ({ id }))
                    }
                }
            });
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
            language: updatedCodeTemplate.language,
            code: updatedCodeTemplate.code,
            tags: updatedCodeTemplate.tags,
            authorId: updatedCodeTemplate.authorId
        });
    } catch (error) {
        console.error(`Error in /app/api/code_template/edit: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const PUT = withAuth(handler);
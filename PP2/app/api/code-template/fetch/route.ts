// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { CodeTemplate, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

interface CodeTemplateResponse {
    data: CodeTemplate;
}

interface ErrorResponse {
    error: string;
}

export async function GET(req: AuthenticatedRequest): Promise<NextResponse<CodeTemplateResponse | ErrorResponse>> {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    try {
        console.log('Fetching code template with id:', id)
        const codeTemplate = await prisma.codeTemplate.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                blogPosts: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        author: {
                            select: { id: true, firstName: true, lastName: true }
                        }
                    }
                },
                tags: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                forks: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        author: {
                            select: { id: true, firstName: true, lastName: true}
                        }
                    }
                },
                forkOf: {
                    select: {
                        id: true,
                        title: true,
                        author: {
                            select: { id: true, firstName: true, lastName: true }
                        }
                    }
                }
            }
        });

        if (!codeTemplate) {
            return NextResponse.json({ error: 'Code template not found' }, { status: 404 });
        }

        return NextResponse.json({ data: codeTemplate }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
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
    const { searchParams } = new URL(req.url);

    let page = searchParams.get('page');
    let limit = searchParams.get('limit');
    const title = searchParams.get('title');
    const tag_id = searchParams.get('tag_id');
    const explanation = searchParams.get('explanation');

    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    console.log(`page: ${page}, limit: ${limit}, title: ${title}, tag_id: ${tag_id}, explanation: ${explanation}`);

    if (page < 1 || limit < 1) {
        return NextResponse.json({ error: 'Invalid page or limit' }, { status: 400 });
    }

    try {
        const where = {};
        where.authorId = user.id;

        if (title) {
            where.title = {
                contains: title.toLowerCase()
            };
        }

        if (explanation) {
            where.explanation = {
                contains: explanation.toLocaleLowerCase()
            };
        }

        if (tag_id) {
            where.tags = {
                some: {
                    id: parseInt(tag_id)
                }
            };
        }

        console.log(`where: ${JSON.stringify(where)}`);

        const totalCount = await prisma.codeTemplate.count({
            where: where,
        });

        console.log(`totalCount: ${totalCount}`);

        const offset = (page - 1) * limit;

        const codeTemplates = await prisma.codeTemplate.findMany({
            skip: offset,
            take: limit,
            where: where,
            include: {
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
                        lastName: true
                    }
                },
                forks: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        author: {
                            select: { id: true, firstName: true, lastName: true }
                        }
                    }
                },
            }
        });

        console.log(`codeTemplates: ${JSON.stringify(codeTemplates)}`);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: codeTemplates,
            totalPages: totalPages,
            totalCount: totalCount,
        });
    } catch (error) {
        console.log(`fetch-user error: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const GET = withAuth(handler);
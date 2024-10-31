import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';
import { parseStringToNumberArray } from '@/app/utils/parseString';

const prisma = new PrismaClient();

export async function handler(req) {
    const user = req.user;
    console.log(`user: ${JSON.stringify(user)}`);

    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    let page = searchParams.get('page');
    let limit = searchParams.get('limit');
    const title = searchParams.get('title');
    const content = searchParams.get('content');
    let tag_ids = searchParams.get('tag_ids');
    let code_template_ids = searchParams.get('code_template_ids');

    if (tag_ids?.length > 0
        && (tag_ids[0] !== '['
        || tag_ids[tag_ids.length - 1] !== ']')) {
        return NextResponse.json({ error: 'Invalid tag_ids' }, { status: 400 });
    }
    if (code_template_ids?.length > 0
        && (code_template_ids[0] !== '['
        || code_template_ids[code_template_ids.length - 1] !== ']')) {
        return NextResponse.json({ error: 'Invalid code_template_ids' }, { status: 400 });
    }

    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    tag_ids = tag_ids ? parseStringToNumberArray(tag_ids) : [];
    code_template_ids = code_template_ids ? parseStringToNumberArray(code_template_ids) : [];
    

    console.log(`page: ${page}, limit: ${limit}, title: ${title}, content: ${content}, tag_ids: ${tag_ids}, code_template_ids: ${code_template_ids}`);

    try {
        const where = {};

        if (title) {
            where.title = {
                contains: title.toLowerCase()
            };
        }

        if (content) {
            where.content = {
                contains: content.toLocaleLowerCase()
            };
        }

        if (tag_ids?.length > 0) {
            where.AND = tag_ids.map(id => ({
                tags: {
                    some: {
                        id: id
                    }
                }
            }));
        }

        if (code_template_ids?.length > 0) {
            where.AND = code_template_ids.map(id => ({
                codeTemplates: {
                    some: {
                        id: id
                    }
                }
            }));
        }

        console.log(`where: ${JSON.stringify(where)}`);

        const totalCount = await prisma.blogPost.count({
            where: where,
        });

        console.log(`totalCount: ${totalCount}`);

        const offset = (page - 1) * limit;

        const blogPosts = await prisma.blogPost.findMany({
            skip: offset,
            take: limit,
            where: where,
            select: {
                id: true,
                title: true,
                content: true,
                tags: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                codeTemplates: {
                    select: {
                        id: true,
                        title: true,
                    }
                },
                authorId: true,
            }
        });

        console.log(`blogPosts: ${JSON.stringify(blogPosts)}`);

        const totalPages = Math.ceil(blogPosts.length / limit);

        return NextResponse.json({
            totalPages: totalPages,
            totalCount: totalCount,
            data: blogPosts,
        });
    } catch (error) {
        console.error(`Error in /app/api/blogpost/fetch-all: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const GET = withAuth(handler);
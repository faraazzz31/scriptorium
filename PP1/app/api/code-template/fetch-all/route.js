import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
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
                tags: { select: { id: true, name: true } },
                author: { select: { id: true, firstName: true, lastName: true } },
            }
        });

        console.log(`codeTemplates: ${JSON.stringify(codeTemplates)}`);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: codeTemplates,
            totalPages: totalPages,
            totalCount: totalCount,
        });
    } catch {
        console.error(`Error in /app/api/code_template/fetch: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
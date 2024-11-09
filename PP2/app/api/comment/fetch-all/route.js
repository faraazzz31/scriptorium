// Used Github co-pilot to help me write this code

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { valueScore, controversyScore } from '@/app/utils/sortingScore';

const prisma = new PrismaClient();

export async function handler(req) {
    const { searchParams } = new URL(req.url);

    let page = searchParams.get('page');
    let limit = searchParams.get('limit');
    const content = searchParams.get('content');
    const authorId = searchParams.get('authorId');
    const blogPostId = searchParams.get('blogPostId');
    const parentId = searchParams.get('parentId');
    const sorting = searchParams.get('sorting');

    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    console.log(`page: ${page}, limit: ${limit}, authorId: ${authorId}, parentId: ${parentId}, content: ${content}, sorting: ${sorting}`);

    try {
        const where = {};

        if (content) {
            where.content = {
                contains: content.toLocaleLowerCase()
            };
        }

        if (authorId) {
            where.authorId = parseInt(authorId);
        }

        // Check if both blogPostId and parentId are provided
        if (blogPostId && parentId) {
            return NextResponse.json({ error: 'Both blogPostId and parentId cannot be provided. A comment can only belong to either blog post or another comment, but not both' }, { status: 400 });
        }

        if (blogPostId) {
            where.blogPostId = parseInt(blogPostId);
        }

        if (parentId) {
            where.parentId = parseInt(parentId);
        }

        console.log(`where: ${JSON.stringify(where)}`);

        const totalCount = await prisma.comment.count({
            where: where,
        });

        console.log(`totalCount: ${totalCount}`);

        const offset = (page - 1) * limit;

        let comments = await prisma.comment.findMany({
            skip: offset,
            take: limit,
            where: where,
            select: {
                id: true,
                content: true,
                upvotes: true,
                downvotes: true,
                authorId: true,
                blogPostId: true,
                parentId: true,
            }
        });

        console.log(`comments: ${JSON.stringify(comments)}`);

        if (sorting === 'Most valued') {
            comments = comments.sort((a, b) => valueScore(b.upvotes, b.downvotes) - valueScore(a.upvotes, a.downvotes));
        } else if (sorting === 'Most controversial') {
            comments = comments.sort((a, b) => controversyScore(b.upvotes, b.downvotes) - controversyScore(a.upvotes, a.downvotes));
        }

        console.log(`comments after sorting: ${JSON.stringify(comments)}`);

        const totalPages = Math.ceil(comments.length / limit);

        return NextResponse.json({
            sorting: sorting ? sorting : 'No sorting',
            totalPages: totalPages,
            totalCount: totalCount,
            data: comments,
        });
    } catch (error) {
        console.error(`Error in /app/api/comment/fetch-all: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const GET = handler;
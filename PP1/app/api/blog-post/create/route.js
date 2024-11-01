import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

const prisma = new PrismaClient();

async function handler(req) {
    const user = req.user;
    console.log(`user: ${JSON.stringify(user)}`);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { title, description, content, tag_ids } = await req.json();
        console.log(`title: ${title}, description: ${description}, content: ${content}, tags: ${tag_ids}`);

        if (!title || !description || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const data = {
            title,
            description,
            content,
            author: {
                connect: {
                    id: user.id,
                },
            },
        };

        if (tag_ids && tag_ids.length > 0) {
            data.tags = {
                connect: tag_ids.map(tag_id => ({ id: tag_id })),
            };
        }

        const blogPost = await prisma.blogPost.create({
            data,
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    }
                },
                tags: true,
            }
        });

        return NextResponse.json({
            id: blogPost.id,
            title: blogPost.title,
            description: blogPost.description,
            content: blogPost.content,
            author: blogPost.author,
            tags: blogPost.tags,
            upvotes: blogPost.upvotes,
            downvotes: blogPost.downvotes,
            createdAt: blogPost.createdAt,
            updatedAt: blogPost.updatedAt,
        });
    } catch (error) {
        console.error(`Error in /app/api/blogpost/create-blogpost: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const POST = withAuth(handler);
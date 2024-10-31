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
        const { content, blogPostId } = await req.json();
        console.log(`content: ${content}, blogPostId: ${blogPostId}`);

        if (!content || !blogPostId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const blogPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(blogPostId) }
        });

        if (!blogPost) {
            return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                author: {
                    connect: {
                        id: user.id,
                    },
                },
                blogPost: {
                    connect: {
                        id: parseInt(blogPostId),
                    },
                },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    }
                },
                blogPost: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            }
        });

        return NextResponse.json({
            id: comment.id,
            content: comment.content,
            author: comment.author,
            blogPost: comment.blogPost,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        });
    } catch (error) {
        console.error(`Error in /app/api/blogpost/create-comment: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const POST = withAuth(handler);
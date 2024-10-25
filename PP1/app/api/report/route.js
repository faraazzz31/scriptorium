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
        const { type, reason, explanation, blogPostId, commentId } = await req.json();
        console.log(`type: ${type}, reason: ${reason}, explanation: ${explanation}, blogPostId: ${blogPostId}, commentId: ${commentId}`);

        // Validate required fields
        if (!type || !reason || !explanation) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate type
        if (!['BLOG_POST', 'COMMENT'].includes(type)) {
            return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
        }

        // Check if reported item exists
        if (type === 'BLOG_POST' && blogPostId) {
            const blogPost = await prisma.blogPost.findUnique({
                where: { id: parseInt(blogPostId) }
            });

            if (!blogPost) {
                return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
            }

            // Check if user has already reported this blog post
            const existingReport = await prisma.report.findFirst({
                where: {
                    type: 'BLOG_POST',
                    blogPostId: parseInt(blogPostId),
                    reporterId: user.id
                }
            });

            if (existingReport) {
                return NextResponse.json({ error: 'You have already reported this blog post' }, { status: 400 });
            }
        } else if (type === 'COMMENT' && commentId) {
            const comment = await prisma.comment.findUnique({
                where: { id: parseInt(commentId) }
            });

            if (!comment) {
                return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
            }

            // Check if user has already reported this comment
            const existingReport = await prisma.report.findFirst({
                where: {
                    type: 'COMMENT',
                    commentId: parseInt(commentId),
                    reporterId: user.id
                }
            });

            if (existingReport) {
                return NextResponse.json({ error: 'You have already reported this comment' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ error: 'Missing target ID' }, { status: 400 });
        }

        // Create the report
        const report = await prisma.report.create({
            data: {
                type,
                reason,
                explanation,
                reporter: {
                    connect: {
                        id: user.id,
                    },
                },
                ...(type === 'BLOG_POST'
                        ? {
                            blogPost: {
                                connect: { id: parseInt(blogPostId) }
                            }
                        }
                        : {
                            comment: {
                                connect: { id: parseInt(commentId) }
                            }
                        }
                )
            }
        });

        return NextResponse.json({
            id: report.id,
            type: report.type,
            reason: report.reason,
            explanation: report.explanation,
            status: report.status,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
        });
    } catch (error) {
        console.error(`Error in /app/api/report: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const POST = withAuth(handler);
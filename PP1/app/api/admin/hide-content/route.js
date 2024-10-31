import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

const prisma = new PrismaClient();

async function handler(req) {
    const user = req.user;
    console.log(`user: ${JSON.stringify(user)}`);

    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    try {
        const { type, contentId, hide = true } = await req.json();
        console.log(`type: ${type}, contentId: ${contentId}, hide: ${hide}`);

        if (!type || !contentId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['BLOG_POST', 'COMMENT'].includes(type)) {
            return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
        }

        let updatedContent;
        let relatedReports;

        if (type === 'BLOG_POST') {
            const blogPost = await prisma.blogPost.findUnique({
                where: { id: parseInt(contentId) }
            });

            if (!blogPost) {
                return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
            }

            updatedContent = await prisma.$transaction(async (prisma) => {
                const updatedPost = await prisma.blogPost.update({
                    where: { id: parseInt(contentId) },
                    data: {
                        isHidden: hide,
                        hiddenAt: hide ? new Date() : null,
                        hiddenBy: hide ? { connect: { id: user.id } } : { disconnect: true }
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true
                            }
                        },
                        reports: true
                    }
                });

                if (hide) {
                    relatedReports = await prisma.report.updateMany({
                        where: {
                            type: 'BLOG_POST',
                            blogPostId: parseInt(contentId),
                            status: 'PENDING'
                        },
                        data: {
                            status: 'RESOLVED'
                        }
                    });

                    await prisma.comment.updateMany({
                        where: { blogPostId: parseInt(contentId) },
                        data: {
                            isHidden: true,
                            hiddenAt: new Date(),
                            hiddenById: user.id
                        }
                    });
                }

                return updatedPost;
            });

        } else {
            const comment = await prisma.comment.findUnique({
                where: { id: parseInt(contentId) }
            });

            if (!comment) {
                return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
            }

            updatedContent = await prisma.$transaction(async (prisma) => {
                const updatedComment = await prisma.comment.update({
                    where: { id: parseInt(contentId) },
                    data: {
                        isHidden: hide,
                        hiddenAt: hide ? new Date() : null,
                        hiddenBy: hide ? { connect: { id: user.id } } : { disconnect: true }
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true
                            }
                        },
                        blogPost: {
                            select: {
                                id: true,
                                title: true
                            }
                        },
                        reports: true
                    }
                });

                if (hide) {
                    relatedReports = await prisma.report.updateMany({
                        where: {
                            type: 'COMMENT',
                            commentId: parseInt(contentId),
                            status: 'PENDING'
                        },
                        data: {
                            status: 'RESOLVED'
                        }
                    });
                }

                return updatedComment;
            });
        }

        return NextResponse.json({
            success: true,
            message: `Content has been ${hide ? 'hidden' : 'unhidden'}`,
            content: {
                type,
                id: updatedContent.id,
                isHidden: updatedContent.isHidden,
                hiddenAt: updatedContent.hiddenAt,
                author: updatedContent.author,
                ...(type === 'COMMENT' && { blogPost: updatedContent.blogPost }),
                reportCount: updatedContent.reports.length,
                updatedReports: relatedReports
            }
        });
    } catch (error) {
        console.error(`Error in /app/api/admin/hide-content: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const POST = withAuth(handler);
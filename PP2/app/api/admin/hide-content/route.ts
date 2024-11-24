// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, User} from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

const prisma = new PrismaClient();

type ContentType = 'BLOG_POST' | 'COMMENT';

interface RequestBody {
    type: ContentType;
    contentId: string;
    hide?: boolean;
}

interface AuthenticatedRequest extends NextRequest {
    user: User;
}

interface AuthorInfo {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
}

interface BlogPostInfo {
    id: number;
    title: string;
}

// Define separate response types for each content type
interface BaseBlogPostResponse {
    type: 'BLOG_POST';
    id: number;
    isHidden: boolean;
    hiddenAt: Date | null;
    author: AuthorInfo;
    reportCount: number;
    updatedReports: { count: number } | null;
}

interface BaseCommentResponse {
    type: 'COMMENT';
    id: number;
    isHidden: boolean;
    hiddenAt: Date | null;
    author: AuthorInfo;
    blogPost?: BlogPostInfo;
    reportCount: number;
    updatedReports: { count: number } | null;
}

type ContentResponse = BaseBlogPostResponse | BaseCommentResponse;

async function handler(req: AuthenticatedRequest): Promise<NextResponse> {
    const user = req.user;
    console.log(`user: ${JSON.stringify(user)}`);

    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    try {
        const { type, contentId, hide = true }: RequestBody = await req.json();
        console.log(`type: ${type}, contentId: ${contentId}, hide: ${hide}`);

        if (!type || !contentId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['BLOG_POST', 'COMMENT'].includes(type)) {
            return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
        }

        let response: ContentResponse;

        if (type === 'BLOG_POST') {
            const blogPost = await prisma.blogPost.findUnique({
                where: { id: parseInt(contentId) }
            });

            if (!blogPost) {
                return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
            }

            const updatedContent = await prisma.$transaction(async (prisma) => {
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

                let relatedReports = null;
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

                return { post: updatedPost, relatedReports };
            });

            response = {
                type: 'BLOG_POST',
                id: updatedContent.post.id,
                isHidden: updatedContent.post.isHidden,
                hiddenAt: updatedContent.post.hiddenAt,
                author: updatedContent.post.author,
                reportCount: updatedContent.post.reports.length,
                updatedReports: updatedContent.relatedReports
            };

        } else {
            const comment = await prisma.comment.findUnique({
                where: { id: parseInt(contentId) }
            });

            if (!comment) {
                return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
            }

            const updatedContent = await prisma.$transaction(async (prisma) => {
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

                let relatedReports = null;
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

                return { comment: updatedComment, relatedReports };
            });

            response = {
                type: 'COMMENT',
                id: updatedContent.comment.id,
                isHidden: updatedContent.comment.isHidden,
                hiddenAt: updatedContent.comment.hiddenAt,
                author: updatedContent.comment.author,
                blogPost: updatedContent.comment.blogPost || undefined,
                reportCount: updatedContent.comment.reports.length,
                updatedReports: updatedContent.relatedReports
            };
        }

        return NextResponse.json({
            success: true,
            message: `Content has been ${hide ? 'hidden' : 'unhidden'}`,
            content: response
        });
    } catch (error) {
        console.error(`Error in /app/api/admin/hide-content: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// @ts-ignore
export const POST = withAuth(handler);
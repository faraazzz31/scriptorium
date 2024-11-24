// Used Github co-pilot to help me write this code
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, User, BlogPost, Comment } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

const prisma = new PrismaClient();

type ReportType = 'ALL' | 'BLOG_POST' | 'COMMENT';
type ReportStatus = 'PENDING' | 'RESOLVED' | string;

interface AuthenticatedRequest extends NextRequest {
    user: User;
}

interface AuthorInfo {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
}

interface BlogPostInfo {
    id: number;
    title: string;
    description: string;
}

interface ReportInfo {
    id: number;
    reason: string;
    explanation: string;
    status: string;
    createdAt: Date;
    reporter: AuthorInfo;
    avatar: string | null;
}

interface BlogPostResult {
    type: 'BLOG_POST';
    id: number;
    content: {
        id: number;
        title: string;
        description: string;
        author: AuthorInfo;
        avatar: string | null;
    };
    reportCount: number;
    reports: ReportInfo[];
    isHidden: boolean;
}

interface CommentResult {
    type: 'COMMENT';
    id: number;
    content: {
        id: number;
        text: string;
        author: AuthorInfo;
        blogPost: BlogPostInfo | null;
    };
    reportCount: number;
    reports: ReportInfo[];
    isHidden: boolean;
}

type ReportResult = BlogPostResult | CommentResult;

interface PaginationInfo {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
}

interface ApiResponse {
    results: ReportResult[];
    pagination: PaginationInfo;
}

async function handler(req: AuthenticatedRequest): Promise<NextResponse<ApiResponse | { error: string }>> {
    const user = req.user;
    console.log(`user: ${JSON.stringify(user)}`);

    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const type = (searchParams.get('type') || 'ALL') as ReportType;
        const status = searchParams.get('status') as ReportStatus | null;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        console.log(`Fetching reports - type: ${type}, status: ${status}, page: ${page}, limit: ${limit}`);

        type BlogPostWithReports = BlogPost & {
            author: AuthorInfo;
            _count: { reports: number };
            reports: ReportInfo[];
        };

        type CommentWithReports = Comment & {
            author: AuthorInfo;
            blogPost: BlogPostInfo | null;
            _count: { reports: number };
            reports: ReportInfo[];
        };

        const reportedBlogPosts = type !== 'COMMENT' ? await prisma.blogPost.findMany({
            where: {
                reports: {
                    some: status ? { status } : {}
                }
            },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                _count: {
                    select: { reports: true }
                },
                reports: {
                    select: {
                        id: true,
                        reason: true,
                        explanation: true,
                        status: true,
                        createdAt: true,
                        reporter: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                avatar: true
                            }
                        }
                    },
                    where: status ? { status } : {},
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: {
                reports: {
                    _count: 'desc'
                }
            },
            skip: type === 'ALL' ? 0 : skip,
            take: type === 'ALL' ? undefined : limit
        }) as BlogPostWithReports[] : [];

        const reportedComments = type !== 'BLOG_POST' ? await prisma.comment.findMany({
            where: {
                reports: {
                    some: status ? { status } : {}
                }
            },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                blogPost: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                },
                _count: {
                    select: { reports: true }
                },
                reports: {
                    select: {
                        id: true,
                        reason: true,
                        explanation: true,
                        status: true,
                        createdAt: true,
                        reporter: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                avatar: true
                            }
                        }
                    },
                    where: status ? { status } : {},
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: {
                reports: {
                    _count: 'desc'
                }
            },
            skip: type === 'ALL' ? 0 : skip,
            take: type === 'ALL' ? undefined : limit
        }) as CommentWithReports[] : [];

        let results: ReportResult[];
        if (type === 'ALL') {
            results = [
                ...reportedBlogPosts.map((post): BlogPostResult => ({
                    type: 'BLOG_POST',
                    id: post.id,
                    content: {
                        id: post.id,
                        title: post.title,
                        description: post.description,
                        author: post.author,
                        avatar: post.author.avatar
                    },
                    reportCount: post._count.reports,
                    reports: post.reports,
                    isHidden: post.isHidden
                })),
                ...reportedComments.map((comment): CommentResult => ({
                    type: 'COMMENT',
                    id: comment.id,
                    content: {
                        id: comment.id,
                        text: comment.content,
                        author: comment.author,
                        blogPost: comment.blogPost
                    },
                    reportCount: comment._count.reports,
                    reports: comment.reports,
                    isHidden: comment.isHidden
                }))
            ]
                .sort((a, b) => b.reportCount - a.reportCount)
                .slice(skip, skip + limit);
        } else {
            results = type === 'BLOG_POST'
                ? reportedBlogPosts.map((post): BlogPostResult => ({
                    type: 'BLOG_POST',
                    id: post.id,
                    content: {
                        id: post.id,
                        title: post.title,
                        description: post.description,
                        author: post.author,
                        avatar: post.author.avatar
                    },
                    reportCount: post._count.reports,
                    reports: post.reports,
                    isHidden: post.isHidden
                }))
                : reportedComments.map((comment): CommentResult => ({
                    type: 'COMMENT',
                    id: comment.id,
                    content: {
                        id: comment.id,
                        text: comment.content,
                        author: comment.author,
                        blogPost: comment.blogPost
                    },
                    reportCount: comment._count.reports,
                    reports: comment.reports,
                    isHidden: comment.isHidden
                }));
        }

        const totalBlogPostReports = type !== 'COMMENT' ? await prisma.blogPost.count({
            where: {
                reports: {
                    some: status ? { status } : {}
                }
            }
        }) : 0;

        const totalCommentReports = type !== 'BLOG_POST' ? await prisma.comment.count({
            where: {
                reports: {
                    some: status ? { status } : {}
                }
            }
        }) : 0;

        const total = type === 'ALL'
            ? totalBlogPostReports + totalCommentReports
            : type === 'BLOG_POST'
                ? totalBlogPostReports
                : totalCommentReports;

        console.log(`Found ${results.length} results`);

        return NextResponse.json({
            results,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(`Error in /app/api/admin/sort-reports: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const GET = withAuth(handler);
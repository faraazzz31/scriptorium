// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { valueScore, controversyScore } from '@/app/utils/sortingScore';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

interface CommentFetchAllResponse {
  sorting: string;
  totalPages: number;
  totalCount: number;
  data: {
    id: number;
    content: string;
    upvotes: number;
    downvotes: number;
    author: {
      id: number;
      firstName: string | null;
      lastName: string | null;
    };
    blogPostId: number | null;
    parentId: number | null;
    upvotedBy: {
      id: number;
    }[];
    downvotedBy: {
      id: number;
    }[];
    createdAt: Date;
  }[];
}

interface ErrorResponse {
  error: string;
}

interface Reply {
  id: number;
  content: string;
  upvotes: number;
  downvotes: number;
  blogPostId: number | null;
  parentId: number | null;
  createdAt: Date;
}

// Recursive function to get all replies
async function getReplies(commentId: number): Promise<Reply[]> {
  const replies = await prisma.comment.findMany({
    where: { parentId: commentId },
    select: {
      id: true,
      content: true,
      upvotes: true,
      downvotes: true,
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
      blogPostId: true,
      parentId: true,
      upvotedBy: {
        select: {
          id: true,
        }
      },
      downvotedBy: {
        select: {
          id: true,
        }
      },
      createdAt: true,
    }
  });

  // Get replies for each reply recursively
  const repliesWithChildren = await Promise.all(
    replies.map(async (reply) => ({
      ...reply,
      replies: await getReplies(reply.id)
    }))
  );

  return repliesWithChildren;
}

export async function handler(req: AuthenticatedRequest): Promise<NextResponse<CommentFetchAllResponse | ErrorResponse>> {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const content = searchParams.get('content');
  const authorId = searchParams.get('authorId');
  const blogPostId = searchParams.get('blogPostId');
  const sorting = searchParams.get('sorting');

  try {
    // Base where clause for top-level comments
    const where: Prisma.CommentWhereInput = {
      parentId: null, // Only fetch top-level comments for pagination
    };

    if (content) {
      where.content = {
        contains: content.toLocaleLowerCase()
      };
    }
    if (authorId) {
      where.authorId = parseInt(authorId);
    }
    if (blogPostId) {
      where.blogPostId = parseInt(blogPostId);
    }

    // Count total top-level comments for pagination
    const totalCount = await prisma.comment.count({
      where: where,
    });

    const offset = (page - 1) * limit;

    // Get paginated top-level comments
    let comments = await prisma.comment.findMany({
      where: where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        content: true,
        upvotes: true,
        downvotes: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        blogPostId: true,
        parentId: true,
        upvotedBy: {
          select: {
            id: true,
          }
        },
        downvotedBy: {
          select: {
            id: true,
          }
        },
        createdAt: true,
      }
    });

    // Sorting
    if (sorting === 'Most valued') {
      comments = comments.sort(
        (a, b) => valueScore(b.upvotes, b.downvotes) - valueScore(a.upvotes, a.downvotes)
      );
    } else if (sorting === 'Most controversial') {
      comments = comments.sort(
        (a, b) => controversyScore(b.upvotes, b.downvotes) - controversyScore(a.upvotes, a.downvotes)
      );
    } else {
    }

    // Paginate
    comments = comments.slice(offset, offset + limit);

    // Add replies to each top-level comment
    const sortedCommentsWithReplies = await Promise.all(
      comments.map(async (comment) => ({
        ...comment,
        replies: await getReplies(comment.id)
      }))
    );

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      sorting: sorting ? sorting : 'No sorting',
      totalPages: totalPages,
      totalCount: totalCount,
      data: sortedCommentsWithReplies,
    });

  } catch (error) {
    console.error(`Error in /app/api/comment/fetch-all: ${error}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = handler;
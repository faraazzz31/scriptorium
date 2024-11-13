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
    authorId: number;
    blogPostId: number | null;
    parentId: number | null;
  }[];
}

interface ErrorResponse {
  error: string;
}

export async function handler(req: AuthenticatedRequest): Promise<NextResponse<CommentFetchAllResponse | ErrorResponse>> {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const content = searchParams.get('content');
  const authorId = searchParams.get('authorId');
  const blogPostId = searchParams.get('blogPostId');
  const parentId = searchParams.get('parentId');
  const sorting = searchParams.get('sorting');

  console.log(`page: ${page}, limit: ${limit}, authorId: ${authorId}, parentId: ${parentId}, content: ${content}, sorting: ${sorting}`);

  try {
    const where: Prisma.CommentWhereInput = {};

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
// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { parseStringToNumberArray } from '@/app/utils/parseString';
import { valueScore, controversyScore } from '@/app/utils/sortingScore';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

interface BlogPostFetchAllResponse {
  sorting: string;
  totalPages: number;
  totalCount: number;
  data: {
    id: number;
    title: string;
    description: string;
    upvotes: number;
    downvotes: number;
    tags: {
      id: number;
      name: string;
    }[];
    codeTemplates: {
      id: number;
      title: string;
    }[];
    authorId: number;
    isHidden: boolean;
  }[];
}

interface ErrorResponse {
  error: string;
}

export async function handler(req: AuthenticatedRequest): Promise<NextResponse<BlogPostFetchAllResponse | ErrorResponse>> {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const title = searchParams.get('title');
  const description = searchParams.get('description');
  const authorId = searchParams.get('authorId');
  const tag_ids_param = searchParams.get('tag_ids');
  const code_template_ids_param = searchParams.get('code_template_ids');
  const sorting = searchParams.get('sorting');

  if (tag_ids_param && tag_ids_param.length > 0
    && (tag_ids_param[0] !== '['
      || tag_ids_param[tag_ids_param.length - 1] !== ']')) {
    return NextResponse.json({ error: 'Invalid tag_ids' }, { status: 400 });
  }
  if (code_template_ids_param && code_template_ids_param.length > 0
    && (code_template_ids_param[0] !== '['
      || code_template_ids_param[code_template_ids_param.length - 1] !== ']')) {
    return NextResponse.json({ error: 'Invalid code_template_ids' }, { status: 400 });
  }

  const tag_ids = tag_ids_param ? parseStringToNumberArray(tag_ids_param) : [];
  const code_template_ids = code_template_ids_param ? parseStringToNumberArray(code_template_ids_param) : [];


  console.log(`page: ${page}, limit: ${limit}, title: ${title}, description: ${description}, tag_ids: ${tag_ids}, code_template_ids: ${code_template_ids}, sorting: ${sorting}`);

  try {
    const where: Prisma.BlogPostWhereInput = {};

    if (title) {
      where.title = {
        contains: title.toLowerCase()
      };
    }

    if (description) {
      where.description = {
        contains: description.toLocaleLowerCase()
      };
    }

    if (authorId) {
      where.authorId = parseInt(authorId);
    }

    if (tag_ids?.length > 0) {
      where.AND = tag_ids.map(id => ({
        tags: {
          some: {
            id: id
          }
        }
      }));
    }

    if (code_template_ids?.length > 0) {
      where.AND = code_template_ids.map(id => ({
        codeTemplates: {
          some: {
            id: id
          }
        }
      }));
    }

    console.log(`where: ${JSON.stringify(where)}`);

    const totalCount = await prisma.blogPost.count({
      where: where,
    });

    console.log(`totalCount: ${totalCount}`);

    const offset = (page - 1) * limit;

    let blogPosts = await prisma.blogPost.findMany({
      skip: offset,
      take: limit,
      where: where,
      select: {
        id: true,
        title: true,
        description: true,
        upvotes: true,
        downvotes: true,
        tags: {
          select: {
            id: true,
            name: true
          }
        },
        codeTemplates: {
          select: {
            id: true,
            title: true,
          }
        },
        authorId: true,
        isHidden: true,
      }
    });

    console.log(`blogPosts: ${JSON.stringify(blogPosts)}`);

    if (sorting === 'Most valued') {
      blogPosts = blogPosts.sort((a, b) => valueScore(b.upvotes, b.downvotes) - valueScore(a.upvotes, a.downvotes));
    } else if (sorting === 'Most controversial') {
      blogPosts = blogPosts.sort((a, b) => controversyScore(b.upvotes, b.downvotes) - controversyScore(a.upvotes, a.downvotes));
    }

    console.log(`blogPosts after sorting: ${JSON.stringify(blogPosts)}`);

    const totalPages = Math.ceil(blogPosts.length / limit);

    return NextResponse.json({
      sorting: sorting ? sorting : 'No sorting',
      totalPages: totalPages,
      totalCount: totalCount,
      data: blogPosts,
    });
  } catch (error) {
    console.error(`Error in /app/api/blogpost/fetch-all: ${error}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = handler;
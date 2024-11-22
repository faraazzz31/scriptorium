// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma, User } from '@prisma/client';
import { parseStringToNumberArray } from '@/app/utils/parseString';
import { valueScore, controversyScore } from '@/app/utils/sortingScore';
import { checkAuth } from '@/app/middleware/auth';

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
      author: User;
    }[];
    isHidden: boolean;
    author: {
      id: number;
      firstName: string | null;
      lastName: string | null;
    };
    _count: {
      comments: number;
    };
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

export async function handler(req: AuthenticatedRequest): Promise<NextResponse<BlogPostFetchAllResponse | ErrorResponse>> {
  const authResult = await checkAuth(req);

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

  // Print to console to see why an admin can't see a hidden post
  console.log(`authResult.user!.id: ${authResult.user!.id}`);
  console.log(`authResult.user!.role: ${authResult.user!.role}`);

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

    // Add the condition to show hidden posts only for admins or the post author
    if (authResult.isAuthenticated) {
      if (authResult.user!.role === 'ADMIN') {
        // Do nothing, admin can see all posts
      } else {
        // Show only non-hidden posts or posts where the user is the author
        where.OR = [
          { isHidden: false },
          { authorId: authResult.user!.id }
        ];
      }
    } else {
      // Show only non-hidden posts for unauthenticated users
      where.isHidden = false;
    }

    const totalCount = await prisma.blogPost.count({
      where: where,
    });

    const offset = (page - 1) * limit;

    let blogPosts = await prisma.blogPost.findMany({
      where: where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        upvotes: true,
        downvotes: true,
        createdAt: true,
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
            author: true,
          }
        },
        isHidden: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: {
            comments: true
          }
        },
        upvotedBy: {
          select: {
            id: true
          }
        },
        downvotedBy: {
          select: {
            id: true
          }
        },
      }
    });

    // Sorting
    if (sorting === 'Most valued') {
      blogPosts = blogPosts.sort((a, b) => valueScore(b.upvotes, b.downvotes) - valueScore(a.upvotes, a.downvotes));
    } else if (sorting === 'Most controversial') {
      blogPosts = blogPosts.sort((a, b) => controversyScore(b.upvotes, b.downvotes) - controversyScore(a.upvotes, a.downvotes));
    }

    // Paginate
    blogPosts = blogPosts.slice(offset, offset + limit);

    const totalPages = Math.ceil(totalCount / limit);

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
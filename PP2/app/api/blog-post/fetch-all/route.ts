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
      avatar: string | null;
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

export async function GET(req: AuthenticatedRequest): Promise<NextResponse<BlogPostFetchAllResponse | ErrorResponse>> {
  const authResult = await checkAuth(req);

  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const searchQuery = searchParams.get('search');
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

  try {
    const where: Prisma.BlogPostWhereInput = {};
    const conditions: Prisma.BlogPostWhereInput[] = [];

    // Modified search to work with SQLite
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      where.OR = [
        {
          title: {
            contains: searchLower
          }
        },
        {
          description: {
            contains: searchLower
          }
        },
        {
          codeTemplates: {
            some: {
              title: {
                contains: searchLower
              }
            }
          }
        }
      ];
    }

    if (authorId) {
      where.authorId = parseInt(authorId);
    }

    if (tag_ids?.length > 0) {
      // Create a separate condition for each tag ID - all must match
      const tagConditions = tag_ids.map(tagId => ({
        tags: {
          some: {
            id: tagId
          }
        }
      }));
      // Push all tag conditions to ensure ALL selected tags must exist
      conditions.push(...tagConditions);
    }

    if (code_template_ids?.length > 0) {
      conditions.push({
        codeTemplates: {
          some: {
            id: {
              in: code_template_ids
            }
          }
        }
      });
    }

    // Add the condition to show hidden posts only for admins or the post author
    if (authResult.isAuthenticated) {
      if (authResult.user!.role === 'ADMIN') {
        // Do nothing, admin can see all posts
      } else {
        conditions.push({
          OR: [
            { isHidden: false },
            { authorId: authResult.user!.id }
          ]
        });
      }
    } else {
      conditions.push({ isHidden: false });
    }

    // Combine all conditions
    if (conditions.length > 0) {
      where.AND = conditions;
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
            avatar: true,
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

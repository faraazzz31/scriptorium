// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

interface CreateBlogPostRequest {
  title: string;
  description: string;
  tag_ids?: number[];
}

interface CreateBlogPostResponse {
  id: number;
  title: string;
  description: string;
  authorId: number;
  tags: {
    id: number;
    name: string;
  }[];
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ErrorResponse {
  error: string;
}

async function handler(req: AuthenticatedRequest): Promise<NextResponse<CreateBlogPostResponse | ErrorResponse>> {
  const user = req.user;
  console.log(`user: ${JSON.stringify(user)}`);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, tag_ids }: CreateBlogPostRequest = await req.json();
    console.log(`title: ${title}, description: ${description}, tags: ${tag_ids}`);

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const data: Prisma.BlogPostCreateInput = {
      title,
      description,
      author: {
        connect: {
          id: user.id,
        },
      },
    };

    // Check if tag_ids contain only valid tag ids
    if (tag_ids && tag_ids?.length > 0) {
      const valid_tags = await prisma.tag.findMany({
        select: {
          id: true,
        }
      });
      const valid_tag_ids = valid_tags.map(tag => tag.id);
      for (const tag_id of tag_ids) {
        if (!valid_tag_ids.includes(tag_id)) {
          return NextResponse.json({ error: 'tag_ids contain tags that aren\'t in the database' }, { status: 400 });
        }
      }
    }


    if (tag_ids && tag_ids.length > 0) {
      data.tags = {
        connect: tag_ids.map(tag_id => ({ id: tag_id })),
      };
    }

    const blogPost = await prisma.blogPost.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        tags: true,
      }
    });

    return NextResponse.json({
      id: blogPost.id,
      title: blogPost.title,
      description: blogPost.description,
      authorId: blogPost.authorId,
      tags: blogPost.tags,
      upvotes: blogPost.upvotes,
      downvotes: blogPost.downvotes,
      createdAt: blogPost.createdAt,
      updatedAt: blogPost.updatedAt,
    });
  } catch (error) {
    console.error(`Error in /app/api/blogpost/create-blogpost: ${error}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
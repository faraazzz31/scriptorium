// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

interface CreateCommentResponse {
  id: number;
  content: string;
}

interface ErrorResponse {
  error: string;
}

async function handler(req: AuthenticatedRequest): Promise<NextResponse<CreateCommentResponse | ErrorResponse>> {
  const user = req.user;
  console.log(`user: ${JSON.stringify(user)}`);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { toBlogPost, content, blogPostId, parentCommentId } = await req.json();
    console.log(`toBlogPost: ${toBlogPost}, content: ${content}, blogPostId: ${blogPostId}, parentCommentId: ${parentCommentId}`);

    if (toBlogPost === undefined
      || !content
      || ((toBlogPost && !blogPostId) || (!toBlogPost && !parentCommentId))) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (toBlogPost) {
      // Create a comment on a blog post
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: parseInt(blogPostId) }
      });
      if (!blogPost) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          author: {
            connect: {
              id: user.id,
            },
          },
          blogPost: {
            connect: {
              id: parseInt(blogPostId),
            },
          },
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
          blogPost: {
            select: {
              id: true,
              title: true,
            }
          }
        }
      });

      return NextResponse.json({
        id: comment.id,
        content: comment.content,
        author: comment.author,
        blogPost: comment.blogPost,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      });
    } else {
      // Create a comment on another comment
      if (!parentCommentId) {
        return NextResponse.json({ error: 'Invalid parentCommentId' }, { status: 400 });
      }
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentCommentId) }
      });
      if (!parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          author: {
            connect: {
              id: user.id,
            },
          },
          parent: {
            connect: {
              id: parseInt(parentCommentId),
            },
          },
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
          parent: {
            select: {
              id: true,
              content: true,
            }
          }
        }
      })
      return NextResponse.json({
        id: comment.id,
        content: comment.content,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      });
    }
  } catch (error) {
    console.error(`Error in /app/api/blogpost/create-comment: ${error}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
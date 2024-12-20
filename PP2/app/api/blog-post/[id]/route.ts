import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkAuth } from '@/app/middleware/auth';

const prisma = new PrismaClient();

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const authResult = await checkAuth(request);

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid blog post ID' },
        { status: 400 }
      );
    }

    const blogPost = await prisma.blogPost.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        upvotes: true,
        downvotes: true,
        tags: {
          select: {
            id: true,
            name: true,
          }
        },
        codeTemplates: {
          select: {
            id: true,
            title: true,
            author: true,
            language: true,
            code: true,
            explanation: true,
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
        createdAt: true,
        updatedAt: true,
        // Add additional fields specific to single post view
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            },
            upvotes: true,
            downvotes: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10, // Limit initial comments load
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

    if (!blogPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Check if post is hidden and handle visibility
    if (blogPost.isHidden) {
      const isAuthorized = authResult.isAuthenticated && (
        authResult.user!.id === blogPost.author.id || // User is author
        authResult.user!.role === 'ADMIN' // User is admin
      );

      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error(`Error in /api/blog-post/[id]: ${error}`);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
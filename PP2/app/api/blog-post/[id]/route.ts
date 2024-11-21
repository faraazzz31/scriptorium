import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

    // Hide the post if it's marked as hidden (unless user is admin/moderator)
    if (blogPost.isHidden) {
      // TODO: add user role check here once authentication is implemented
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
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
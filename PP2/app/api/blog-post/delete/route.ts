// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAuth } from "@/app/middleware/auth";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

interface DeleteBlogPostResponse {
  message: string;
  blogPostId: number;
}

interface ErrorResponse {
  error: string;
}

async function handler(req: AuthenticatedRequest): Promise<NextResponse<DeleteBlogPostResponse | ErrorResponse>> {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blogPostId } = await req.json();

    console.log(`blogPostId: ${blogPostId}`);

    if (!blogPostId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const blogPost = await prisma.blogPost.findUnique({
      where: {
        id: parseInt(blogPostId),
      },
    });

    if (!blogPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    if (blogPost.authorId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.blogPost.delete({
      where: {
        id: parseInt(blogPostId),
      },
    });

    return NextResponse.json({
      message: "Blog post deleted successfully",
      blogPostId: blogPost.id,
    });
  } catch (error) {
    console.error(`Error in /app/api/blogpost/delete-blogpost: ${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const DELETE = withAuth(handler);
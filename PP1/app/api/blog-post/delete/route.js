import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAuth } from "@/app/middleware/auth";

const prisma = new PrismaClient();

async function handler(req) {
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
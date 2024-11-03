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
    const { type, blogPostId, change } = await req.json();

    console.log(`type: ${type}, blogPostId: ${blogPostId}, change: ${change}`);

    if (!type || !blogPostId || change === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const blogPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(blogPostId) },
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const upvotes = blogPost.upvotes;
    const downvotes = blogPost.downvotes;

    if (type === "UPVOTE" && upvotes + change < 0) {
      return NextResponse.json(
        { error: "Invalid upvote change, resulting in negative" },
        { status: 400 }
      );
    }
    if (type === "DOWNVOTE" && downvotes + change < 0) {
      return NextResponse.json(
        { error: "Invalid downvote change, resulting in negative" },
        { status: 400 }
      );
    }

    const updatedBlogPost = await prisma.blogPost.update({
      where: { id: parseInt(blogPostId) },
      data:
        type === "UPVOTE"
          ? { upvotes: blogPost.upvotes + change }
          : { downvotes: blogPost.downvotes + change },
    });

    return NextResponse.json({
      id: updatedBlogPost.id,
      title: updatedBlogPost.title,
      description: updatedBlogPost.description,
      upvotes: updatedBlogPost.upvotes,
      downvotes: updatedBlogPost.downvotes,
    });
  } catch (error) {
    console.error(`Error in /app/api/blog-post/change-upvote: ${error}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const PATCH = withAuth(handler);

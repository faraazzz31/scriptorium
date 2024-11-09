// Used Github co-pilot to help me write this code

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

    if (type !== "UPVOTE" && type !== "DOWNVOTE") {
      return NextResponse.json(
        { error: "Invalid type, must be UPVOTE or DOWNVOTE" },
        { status: 400 }
      );
    }

    if (change !== 1 && change !== -1) {
      return NextResponse.json(
        { error: "Invalid change, must be 1 or -1" },
        { status: 400 }
      );
    }

    const blogPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(blogPostId) },
      include: { upvotedBy: true, downvotedBy: true },
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const upvotes = blogPost.upvotes;
    const downvotes = blogPost.downvotes;
    const upvotersIds = blogPost.upvotedBy.map((user) => user.id);
    const downvotersIds = blogPost.downvotedBy.map((user) => user.id);

    let updatedBlogPost;

    if (change === 1) {
      if (upvotersIds.includes(user.id)) {
        return NextResponse.json(
          { error: "You have already upvoted this blog post" },
          { status: 400 }
        );
      }
      if (downvotersIds.includes(user.id)) {
        return NextResponse.json(
          { error: "You have already downvoted this blog post" },
          { status: 400 }
        );
      }
      if (type === "UPVOTE") {
        updatedBlogPost = await prisma.blogPost.update({
          where: { id: parseInt(blogPostId) },
          data: {
            upvotes: upvotes + change,
            upvotedBy: { connect: { id: user.id } },
          },
        });
      } else if (type === "DOWNVOTE") {
        updatedBlogPost = await prisma.blogPost.update({
          where: { id: parseInt(blogPostId) },
          data: {
            downvotes: downvotes + change,
            downvotedBy: { connect: { id: user.id } },
          },
        });
      }
    } else if (change === -1) {
      if (type === "UPVOTE") {
        if (!upvotersIds.includes(user.id)) {
          return NextResponse.json(
            { error: "You haven't upvoted this blog post" },
            { status: 400 }
          );
        }
        updatedBlogPost = await prisma.blogPost.update({
          where: { id: parseInt(blogPostId) },
          data: {
            upvotes: upvotes + change,
            upvotedBy: { disconnect: { id: user.id } },
          },
        });
      } else if (type === "DOWNVOTE") {
        if (!downvotersIds.includes(user.id)) {
          return NextResponse.json(
            { error: "You haven't downvoted this blog post" },
            { status: 400 }
          );
        }
        updatedBlogPost = await prisma.blogPost.update({
          where: { id: parseInt(blogPostId) },
          data: {
            downvotes: downvotes + change,
            downvotedBy: { disconnect: { id: user.id } },
          },
        });
      }
    }

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

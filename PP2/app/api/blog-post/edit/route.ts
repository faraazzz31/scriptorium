// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { withAuth } from "@/app/middleware/auth";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

interface BlogPostEditRequest {
  blogPostId: string;
  title: string;
  description: string;
  tag_ids?: number[];
}

interface BlogPostEditResponse {
  id: number;
  title: string;
  description: string;
  tags: {
    id: number;
    name: string;
  }[];
  upvotes: number;
  downvotes: number;
}

interface ErrorResponse {
  error: string;
}

async function handler(req: AuthenticatedRequest): Promise<NextResponse<BlogPostEditResponse | ErrorResponse>> {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blogPostId, title, description, tag_ids }: BlogPostEditRequest = await req.json();

    console.log(`blogPostId: ${blogPostId}, title: ${title}, description: ${description}, tags: ${tag_ids}`);

    if (!blogPostId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const blogPost = await prisma.blogPost.findUnique({
      where: {
        id: parseInt(blogPostId),
      },
      include: {
        tags: true,
      },
    });

    if (!blogPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    if (blogPost.authorId !== user.id) {
      return NextResponse.json({ error: "Unauthorized, you aren't the author of this blog post" }, { status: 401 });
    }

    if (blogPost.isHidden) {
      return NextResponse.json({ error: "Blog post is hidden, can't be edited" }, { status: 403 });
    }

    const data: Prisma.BlogPostUpdateInput = {
      title: title ? title : blogPost.title,
      description: description ? description : blogPost.description,
    }

    // Check if tag_ids contain only valid tag ids
    if (tag_ids && tag_ids.length > 0) {
      const valid_tags = await prisma.tag.findMany({
        select: {
          id: true,
        }
      });
      const valid_tag_ids = valid_tags.map(tag => tag.id);
      for (const tag_id of tag_ids) {
        if (!valid_tag_ids.includes(tag_id)) {
          return NextResponse.json({ error: "tag_ids contain tags that aren't in the database" }, { status: 400 });
        }
      }
    }

    // Handle tags update
    if (tag_ids !== undefined) {
      // Only modify tags if tag_ids is provided
      if (tag_ids.length > 0) {
        // Connect new tags
        data.tags = {
          set: [],  // First disconnect all existing tags
          connect: tag_ids.map(tag_id => ({ id: tag_id })),
        };
      } else {
        // If tag_ids is an empty array, disconnect all tags
        data.tags = {
          set: [],  // This will remove all tag connections
        };
      }
    }

    console.log(`data: ${JSON.stringify(data)}`);

    const updatedBlogPost = await prisma.blogPost.update({
      where: {
        id: blogPost.id,
      },
      data,
      include: {
        tags: true
      }
    });

    return NextResponse.json({
      id: updatedBlogPost.id,
      title: updatedBlogPost.title,
      description: updatedBlogPost.description,
      tags: updatedBlogPost.tags,
      upvotes: updatedBlogPost.upvotes,
      downvotes: updatedBlogPost.downvotes,
    });
  } catch (error) {
    console.error(`Error in /app/api/blogpost/edit-blogpost: ${error}`);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const PUT = withAuth(handler);
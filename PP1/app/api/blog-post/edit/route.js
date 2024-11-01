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
        const { blogPostId, title, content, tag_ids } = await req.json();

        console.log(`blogPostId: ${blogPostId}, title: ${title}, content: ${content}, tags: ${tag_ids}`);

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
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = {
            title: title ? title : blogPost.title,
            content: content ? content : blogPost.content,
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
            content: updatedBlogPost.content,
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
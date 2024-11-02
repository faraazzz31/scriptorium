import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { valueScore, controversyScore } from "@/app/utils/sortingScore";

/**
 * @swagger
 * /api/comment/fetch-all:
 *   get:
 *     summary: Retrieve a paginated list of comments with optional filtering and sorting
 *     description: This endpoint allows users to fetch comments with optional filters like `authorId`, `content`, `parentId`, and custom sorting options. Supports pagination.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of comments to retrieve per page.
 *       - in: query
 *         name: content
 *         schema:
 *           type: string
 *         description: Filter comments by content (partial match).
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: integer
 *         description: Filter comments by author ID.
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: Filter comments by parent comment ID.
 *       - in: query
 *         name: sorting
 *         schema:
 *           type: string
 *           enum: [Most valued, Most controversial]
 *         description: Sorting method for the comments.
 *     responses:
 *       200:
 *         description: A paginated list of comments with optional filtering and sorting
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sorting:
 *                   type: string
 *                   example: Most valued
 *                 totalPages:
 *                   type: integer
 *                   description: The total number of pages.
 *                 totalCount:
 *                   type: integer
 *                   description: The total number of comments.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The comment ID.
 *                         example: 1
 *                       content:
 *                         type: string
 *                         description: The content of the comment.
 *                         example: "This is a sample comment."
 *                       upvotes:
 *                         type: integer
 *                         description: Number of upvotes.
 *                         example: 10
 *                       downvotes:
 *                         type: integer
 *                         description: Number of downvotes.
 *                         example: 2
 *                       authorId:
 *                         type: integer
 *                         description: The ID of the comment's author.
 *                         example: 42
 *                       blogPostId:
 *                         type: integer
 *                         description: The ID of the blog post the comment is associated with.
 *                         example: 101
 *                       parentId:
 *                         type: integer
 *                         description: The ID of the parent comment (if it's a reply).
 *                         example: 3
 *       500:
 *         description: Internal Server Error
 */

const prisma = new PrismaClient();

export async function handler(req) {
  const { searchParams } = new URL(req.url);

  let page = searchParams.get("page");
  let limit = searchParams.get("limit");
  const content = searchParams.get("content");
  const authorId = searchParams.get("authorId");
  const parentId = searchParams.get("parentId");
  const sorting = searchParams.get("sorting");

  page = page ? parseInt(page) : 1;
  limit = limit ? parseInt(limit) : 10;

  console.log(
    `page: ${page}, limit: ${limit}, authorId: ${authorId}, parentId: ${parentId}, content: ${content}, sorting: ${sorting}`
  );

  try {
    const where = {};

    if (content) {
      where.content = {
        contains: content.toLocaleLowerCase(),
      };
    }

    if (authorId) {
      where.authorId = parseInt(authorId);
    }

    if (parentId) {
      where.parentId = parseInt(parentId);
    }

    console.log(`where: ${JSON.stringify(where)}`);

    const totalCount = await prisma.comment.count({
      where: where,
    });

    console.log(`totalCount: ${totalCount}`);

    const offset = (page - 1) * limit;

    let comments = await prisma.comment.findMany({
      skip: offset,
      take: limit,
      where: where,
      select: {
        id: true,
        content: true,
        upvotes: true,
        downvotes: true,
        authorId: true,
        blogPostId: true,
        parentId: true,
      },
    });

    console.log(`comments: ${JSON.stringify(comments)}`);

    if (sorting === "Most valued") {
      comments = comments.sort(
        (a, b) =>
          valueScore(b.upvotes, b.downvotes) -
          valueScore(a.upvotes, a.downvotes)
      );
    } else if (sorting === "Most controversial") {
      comments = comments.sort(
        (a, b) =>
          controversyScore(b.upvotes, b.downvotes) -
          controversyScore(a.upvotes, a.downvotes)
      );
    }

    console.log(`comments after sorting: ${JSON.stringify(comments)}`);

    const totalPages = Math.ceil(comments.length / limit);

    return NextResponse.json({
      sorting: sorting ? sorting : "No sorting",
      totalPages: totalPages,
      totalCount: totalCount,
      data: comments,
    });
  } catch (error) {
    console.error(`Error in /app/api/comment/fetch-all: ${error}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const GET = handler;

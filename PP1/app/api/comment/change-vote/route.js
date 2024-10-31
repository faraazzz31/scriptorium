import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

const prisma = new PrismaClient();

async function handler (req) {
    const user = req.user;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { type, commentId, change } = await req.json();
        
        console.log(`type: ${type}, commentId: ${commentId}, change: ${change}`);

        if (!type || !commentId || change === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId) }
        });

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        const upvotes = comment.upvotes;
        const downvotes = comment.downvotes;

        if (type === "UPVOTE" && upvotes + change < 0) {
            return NextResponse.json({ error: 'Invalid upvote change, resulting in negative' }, { status: 400 });
        }
        if (type === "DOWNVOTE" && downvotes + change < 0) {
            return NextResponse.json({ error: 'Invalid downvote change, resulting in negative' }, { status: 400 });
        }

        const updatedComment = await prisma.comment.update({
            where: { id: parseInt(commentId) },
            data: type === "UPVOTE"
                ? { upvotes: comment.upvotes + change }
                : { downvotes: comment.downvotes + change }
        })

        return NextResponse.json({
            id: updatedComment.id,
            content: updatedComment.content,
            upvotes: updatedComment.upvotes,
            downvotes: updatedComment.downvotes,
        });
    } catch (error) {
        console.error(`Error in /app/api/blog-post/change-upvote: ${error}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const PATCH = withAuth(handler);
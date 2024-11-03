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

        if (type !== "UPVOTE" && type !== "DOWNVOTE") {
            return NextResponse.json({ error: 'Invalid type, must be UPVOTE or DOWNVOTE' }, { status: 400 });
        }

        if (change !== 1 && change !== -1) {
            return NextResponse.json({ error: 'Invalid change, must be 1 or -1' }, { status: 400 });
        }

        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId) },
            include: { upvotedBy: true, downvotedBy: true },
        });

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        const upvotes = comment.upvotes;
        const downvotes = comment.downvotes;
        const upvotersIds = comment.upvotedBy.map((user) => user.id);
        const downvotersIds = comment.downvotedBy.map((user) => user.id);

        let updatedComment;

        if (change === 1) {
            if (upvotersIds.includes(user.id)) {
                return NextResponse.json({ error: 'You have already upvoted this comment' }, { status: 400 });
            }
            if (downvotersIds.includes(user.id)) {
                return NextResponse.json({ error: 'You have already downvoted this comment' }, { status: 400 });
            }
            if (type === "UPVOTE") {
                updatedComment = await prisma.comment.update({
                    where: { id: parseInt(commentId) },
                    data: {
                        upvotes: upvotes + change,
                        upvotedBy: { connect: { id: user.id } },
                    },
                });
            } else if (type === "DOWNVOTE") {
                updatedComment = await prisma.comment.update({
                    where: { id: parseInt(commentId) },
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
                        { error: "You haven't upvoted this comment" },
                        { status: 400 }
                    );
                }
                updatedComment = await prisma.comment.update({
                    where: { id: parseInt(commentId) },
                    data: {
                        upvotes: upvotes + change,
                        upvotedBy: { disconnect: { id: user.id } },
                    },
                });
            } else if (type === "DOWNVOTE") {
                if (!downvotersIds.includes(user.id)) {
                    return NextResponse.json(
                        { error: "You haven't downvoted this comment" },
                        { status: 400 }
                    );
                }
                updatedComment = await prisma.comment.update({
                    where: { id: parseInt(commentId) },
                    data: {
                        downvotes: downvotes + change,
                        downvotedBy: { disconnect: { id: user.id } },
                    },
                });
            }
        }

        return NextResponse.json({
            id: updatedComment.id,
            content: updatedComment.content,
            upvotes: updatedComment.upvotes,
            downvotes: updatedComment.downvotes,
        });
    } catch (error) {
        console.error(`Error in /app/api/blog-post/change-upvote: ${error}`);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export const PATCH = withAuth(handler);
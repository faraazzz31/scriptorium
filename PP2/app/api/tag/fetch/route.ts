// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/app/middleware/auth';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

interface TagFetchResponse {
  tags: {
    id: number;
    name: string;
  }[];
}

interface ErrorResponse {
  error: string;
}

async function handler(req: AuthenticatedRequest): Promise<NextResponse<TagFetchResponse | ErrorResponse>> {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({
      tags: tags
    }
    )
  } catch (error) {
    console.error(`Error in /app/api/tag/fetch: ${error}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withAuth(handler);
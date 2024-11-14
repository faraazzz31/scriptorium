// Used Github co-pilot to help me write this code

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

export async function GET (req: AuthenticatedRequest): Promise<NextResponse<TagFetchResponse | ErrorResponse>> {
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
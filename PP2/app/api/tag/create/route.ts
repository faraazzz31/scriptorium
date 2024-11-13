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

interface TagCreateResponse {
  id: number;
  name: string;
}

interface ErrorResponse {
  error: string;
}

async function handler(req: AuthenticatedRequest): Promise<NextResponse<TagCreateResponse | ErrorResponse>> {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name } = await req.json();

    console.log(`name: ${name}`);

    if (!name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tagExists = await prisma.tag.findUnique({
      where: {
        name: name,
      },
    });

    console.log(`tagExists: ${tagExists}`);

    if (tagExists) {
      return NextResponse.json({ error: 'Tag already exists' }, { status: 400 });
    }

    console.log(`Creating tag with name: ${name}`);

    const tag = await prisma.tag.create({
      data: {
        name: name,
      },
    });

    return NextResponse.json(
      {
        id: tag.id,
        name: tag.name
      }
    );
  } catch (error) {
    console.error(`Error in /app/api/tag/create: ${error}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
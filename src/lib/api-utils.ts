import { NextResponse } from 'next/server';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

type SuccessResponseType<T> = ApiResponse<T> & { success: true; data: T };
type ErrorResponseType = ApiResponse<never> & { success: false; error: string };

export function successResponse<T>(data: T, status = 200): NextResponse<SuccessResponseType<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400): NextResponse<ErrorResponseType> {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
    }
  });
}

interface PrismaError {
  code?: string;
  message: string;
}

export async function handlePrismaError(error: unknown): Promise<NextResponse<ErrorResponseType>> {
  console.error('Database Error:', error);
  
  if (error instanceof Error && 'code' in error) {
    const prismaError = error as PrismaError;
    // P2002: Unique constraint failed
    if (prismaError.code === 'P2002') {
      return errorResponse('Duplicate entry found.', 409);
    }
    // P2025: Record not found
    if (prismaError.code === 'P2025') {
      return errorResponse('Record not found.', 404);
    }
  }
  
  return errorResponse('Internal Server Error', 500);
}
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Event } from '@/database';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET handler to fetch events details by slug
 * @route GET /api/events/[slug]
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Validate slug parameter
    const { slug } = await params;

    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Valid slug parameter is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Query events by slug
    const event = await Event.findOne({ slug: slug.trim() }).lean();

    // Handle events not found
    if (!event) {
      return NextResponse.json(
        { success: false, error: `Event with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    // Return events data
    return NextResponse.json(
      {
        success: true,
        data: event,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    console.error('Error fetching events by slug:', error);

    // Handle database validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while fetching the events',
      },
      { status: 500 }
    );
  }
}

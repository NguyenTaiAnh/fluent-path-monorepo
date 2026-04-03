import { NextRequest, NextResponse } from 'next/server'
import { getCourseWithSections } from '@/services/courseService'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await context.params
    const course = await getCourseWithSections(courseId)
    return NextResponse.json(course)
  } catch (error: unknown) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch course' },
      { status: 500 },
    )
  }
}

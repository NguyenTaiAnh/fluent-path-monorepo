import { createClient } from '@/utils/supabase/server';

/** Mark a lesson as completed for the authenticated user */
export async function markLessonComplete(lessonId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        is_completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' },
    );

  if (error) throw error;
  return data;
}

/** Get all completed lesson IDs for a user in a specific course */
export async function getUserCourseProgress(userId: string, courseId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_progress')
    .select(`
      lesson_id,
      lessons!inner (
        section_id,
        sections!inner (
          course_id
        )
      )
    `)
    .eq('user_id', userId)
    .eq('is_completed', true)
    .eq('lessons.sections.course_id', courseId);

  if (error) throw error;
  return data?.map((p: { lesson_id: string }) => p.lesson_id) ?? [];
}

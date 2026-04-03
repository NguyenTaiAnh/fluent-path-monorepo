import { createAdminClient } from './supabaseAdmin';
import type { UserWithAuth } from 'my-libs';

/** Admin: Fetch all users with profile data */
export async function getAllUsers(): Promise<UserWithAuth[]> {
  const supabase = createAdminClient();

  // Fetch profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) throw profilesError;

  // Fetch auth users to get emails and last_sign_in_at
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) throw authError;

  const authUsers = authData?.users ?? [];

  // Merge profiles with auth data
  return (profiles ?? []).map((profile) => {
    const authUser = authUsers.find((u) => u.id === profile.id);
    return {
      ...profile,
      email: authUser?.email ?? '',
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
    };
  });
}

/** Admin: Update a user's role */
export async function updateUserRole(userId: string, role: 'admin' | 'user') {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Admin: Get user stats */
export async function getUserStats() {
  const supabase = createAdminClient();

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: adminUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin');

  const { count: totalEnrollments } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true });

  return {
    totalUsers: totalUsers ?? 0,
    adminUsers: adminUsers ?? 0,
    totalEnrollments: totalEnrollments ?? 0,
  };
}

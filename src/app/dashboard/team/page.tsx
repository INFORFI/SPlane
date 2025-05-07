import { Suspense } from 'react';
import { getUsers } from '@/action/users/getUsers';
import { requireAuth } from '@/lib/auth';
import TeamClient from './TeamClient';
import TeamLoading from './TeamLoading';

export default function Page() {
  return (
    <Suspense fallback={<TeamLoading />}>
      <TeamPage />
    </Suspense>
  );
}

async function TeamPage() {
  // Get the authenticated user ID
  const userId = await requireAuth();

  if (!userId) {
    return null; // Middleware will handle redirect to login
  }

  // Get all users
  const users = await getUsers();

  return <TeamClient users={users} currentUserId={userId} />;
}

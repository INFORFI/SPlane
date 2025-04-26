import { Suspense } from 'react';
import { getUsers } from '@/action/users/getUsers';
import { requireAuth } from '@/lib/auth';
import CreateProjectPage from './CreateProjectClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>}>
      <CreateProjectPageWrapper />
    </Suspense>
  );
}

async function CreateProjectPageWrapper() {
  // Get the authenticated user ID
  const userId = await requireAuth();
  
  if (!userId) {
    return null; // Middleware will handle redirect to login
  }
  
  // Get all users for team selection
  const users = await getUsers();
  
  return <CreateProjectPage users={users} currentUserId={userId} />;
}
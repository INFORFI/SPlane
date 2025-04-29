import { Suspense } from 'react';
import TasksClient from './TasksClient';
import TasksLoading from './TasksLoading';
import { getAssignedTasks } from '@/action/tasks/getAssignedTasks';
import { requireAuth } from '@/lib/auth';

export default function Page() {
  return (
    <Suspense fallback={<TasksLoading />}>
      <TasksPage />
    </Suspense>
  );
}

async function TasksPage() {
  // Get the authenticated user ID
  const userId = await requireAuth();

  if (!userId) {
    return null; // Handle this case with middleware redirection to login
  }

  // Get tasks assigned to the current user
  const tasks = await getAssignedTasks(userId);

  return <TasksClient tasks={tasks} />;
}

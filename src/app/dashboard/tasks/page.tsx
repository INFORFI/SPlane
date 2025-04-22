import { Suspense } from 'react';
import TasksClient from './TasksClient';
import TasksLoading from './TasksLoading';
import { getAssignedTasks } from '@/action/tasks/getAssignedTasks';
import { requireAuth } from '@/lib/auth';

export default async function TasksPage() {
  // Get the authenticated user ID
  const userId = await requireAuth();
  
  if (!userId) {
    return null; // Handle this case with middleware redirection to login
  }
  
  // Get tasks assigned to the current user
  const tasks = await getAssignedTasks(userId);
  
  return (
    <Suspense fallback={<TasksLoading />}>
      <TasksClient tasks={tasks} />
    </Suspense>
  );
}
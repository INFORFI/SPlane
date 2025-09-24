import { getProjects } from '@/action/projects/getProjects';
import AddTaskClientPage from './AddTaskClientPage';
import { getUsers } from '@/action/users/getUsers';
import { Suspense } from 'react';

interface PageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaskAddPage searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

async function TaskAddPage({ searchParams }: { searchParams: { projectId?: string } }) {
  const projects = await getProjects();
  const users = await getUsers();

  const projectId = searchParams.projectId ? parseInt(searchParams.projectId, 10) : null;

  return <AddTaskClientPage projects={projects} users={users} projectId={projectId} />;
}

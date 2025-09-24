import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/action/projects/getProjectById';
import { getTasksByProject } from '@/action/tasks/getTasks';
import ProjectTasksClient from './ProjectTasksClient';
import TasksLoading from '@/app/dashboard/tasks/TasksLoading';

export default async function ProjectTasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  return (
    <Suspense fallback={<TasksLoading />}>
      <ProjectTasksPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ProjectTasksPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { id } = await params;
  const { filter } = await searchParams;
  const projectId = parseInt(id);

  if (isNaN(projectId)) {
    return notFound();
  }

  const project = await getProjectById(projectId);
  if (!project) {
    return notFound();
  }

  const tasks = await getTasksByProject(projectId);

  return <ProjectTasksClient project={project} tasks={tasks} initialFilter={filter} />;
}

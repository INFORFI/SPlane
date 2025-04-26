import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/action/projects/getProjectById';
import KanbanPage from './KanbanClient';
import KanbanLoading from './KanbanLoading';

export default async function KanbanPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = parseInt(id);

  if (isNaN(projectId)) {
    return notFound();
  }

  const project = await getProjectById(projectId);

  if (!project) {
    return notFound();
  }

  return (
    <Suspense fallback={<KanbanLoading />}>
      <KanbanPage project={project} />
    </Suspense>
  );
}

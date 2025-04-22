import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/action/projects/getProjectById';
import KanbanPage from './KanbanClient';
import KanbanLoading from './KanbanLoading';

interface KanbanPageProps {
  params: {
    id: string;
  };
}

export default async function KanbanPageWrapper({ params }: KanbanPageProps) {
  const projectId = parseInt((await params).id);
  
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
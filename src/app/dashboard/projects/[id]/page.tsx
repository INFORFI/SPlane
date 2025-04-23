import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/action/projects/getProjectById';
import ProjectDetailsClient from './ProjectDetailsClient';
import ProjectDetailsLoading from './ProjectDetailsLoading';

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
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
    <Suspense fallback={<ProjectDetailsLoading />}>
      <ProjectDetailsClient project={project} />
    </Suspense>
  );
}
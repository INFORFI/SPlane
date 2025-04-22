import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/action/projects/getProjectById';
import ProjectDetailsClient from './ProjectDetailsClient';
import ProjectDetailsLoading from './ProjectDetailsLoading';

interface ProjectDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const projectId = parseInt(params.id);
  
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
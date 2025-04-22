import { Suspense } from 'react';
import { getProjects } from '@/action/projects/getProjects';
import ProjectsPage from './ProjectPageClient';
import ProjectsLoading from './ProjectLoading';

export default async function Page() {
    const projects = await getProjects();

    return (
        <Suspense fallback={<ProjectsLoading />}>
            <ProjectsPage projects={projects} />
        </Suspense>
    )
}

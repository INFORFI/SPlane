import { Suspense } from 'react';
import { getProjects } from '@/action/projects/getProjects';
import ProjectsPage from './ProjectPageClient';
import ProjectsLoading from './ProjectLoading';

export const dynamic = 'force-dynamic';

export default function Page() {
    return (
        <Suspense fallback={<ProjectsLoading />}>
            <ProjectPage />
        </Suspense>
    )
}

async function ProjectPage() {
    const projects = await getProjects();

    return <ProjectsPage projects={projects} />;
}

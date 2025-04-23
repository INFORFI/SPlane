import { getProjects } from "@/action/projects/getProjects";
import AddTaskClientPage from "./AddTaskClientPage";
import { getUsers } from "@/action/users/getUsers";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TaskAddPage />
        </Suspense>
    )
}

async function TaskAddPage() {
    const projects = await getProjects();
    const users = await getUsers();

    return <AddTaskClientPage projects={projects} users={users} />
}
"use server";

import { getProjects } from "@/action/projects/getProjects";
import AddTaskClientPage from "./AddTaskClientPage";
import { getUsers } from "@/action/users/getUsers";

export default async function TaskAddPage() {
    const projects = await getProjects();
    const users = await getUsers();

    return <AddTaskClientPage projects={projects} users={users} />
}
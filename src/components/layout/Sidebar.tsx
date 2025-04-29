import { countUserTasks } from "@/action/tasks/countUserTask";
import SidebarClient from "./SidebarClient";

export default async function Sidebar() {
    const tasksCount = await countUserTasks();

    return (
        <SidebarClient tasksCount={tasksCount} />
    );
}
"use server";

import { PrismaClient, Project, Task, User, UserTask } from "@prisma/client";

const prisma = new PrismaClient();

export type ProjectWithTasks = Project & {
    tasks: (Task & {
        userTasks: (UserTask & {
            user: User
        })[]
    })[],
    progress: number,
    teamMembers: User[]
}

export async function getProjects(): Promise<ProjectWithTasks[]> {
    const projects = await prisma.project.findMany({
        include: {
            owner: true,
            tasks: {
                include: {
                    userTasks: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    });

    return projects.map(project => {
        const teamMembers = project.tasks
            .flatMap(task => task.userTasks || [])
            .map(userTask => userTask.user)
            .filter((user, index, self) => 
                index === self.findIndex(u => u.id === user.id)
            );

        const progress = project.tasks.length === 0 
            ? 0 
            : (project.tasks.filter(task => task.status === 'COMPLETED').length / project.tasks.length) * 100;

        return {
            ...project,
            teamMembers,
            progress
        };
    });
}
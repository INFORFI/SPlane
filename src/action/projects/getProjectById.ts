"use server";

import { PrismaClient, Project, Task, User, UserTask } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProjectWithDetails = Project & {
    tasks: (Task & {
        userTasks: (UserTask & {
            user: User
        })[]
    })[],
    owner: User,
    teamMembers: User[]
}

export async function getProjectById(id: number): Promise<ProjectWithDetails | null> {
    try {
        const project = await prisma.project.findUnique({
            where: { id },
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

        if (!project) {
            return null;
        }

        // Extract unique team members from all tasks
        const teamMembers = project.tasks
            .flatMap(task => task.userTasks || [])
            .map(userTask => userTask.user)
            .filter((user, index, self) => 
                index === self.findIndex(u => u.id === user.id)
            );

        return {
            ...project,
            teamMembers
        };
    } catch (error) {
        console.error("Error fetching project:", error);
        return null;
    }
}
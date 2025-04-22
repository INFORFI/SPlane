import { prisma } from "@/lib/prisma";

export async function getUsers() {
    try {
        const users = await prisma.user.findMany();
        return users;
    } catch (error) {
        console.error(error);
        return [];
    }
}
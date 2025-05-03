"use server";

import { requireAuth } from "@/lib/auth";
import { UserSettings } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Settings = Omit<UserSettings, "id" | "userId">;

export async function updateSettings(settings: Settings) {
    const userId = await requireAuth();

    if (!userId) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            settings: true,
        },
    });

    if (!user) {
        return null;
    }

    if (!user.settings) {
        await prisma.userSettings.create({
            data: {
                userId: userId,
                notifications_patch_notes: settings.notifications_patch_notes,
            },
        });
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            settings: {
                update: {
                    notifications_patch_notes: settings.notifications_patch_notes,
                },
            },
        },
    });

    return updatedUser;
}
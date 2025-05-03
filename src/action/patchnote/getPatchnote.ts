import { prisma } from "@/lib/prisma";
import { PatchNote } from "@prisma/client";

export default async function getPatchnote(id: string | number): Promise<PatchNote | null> {
    try {
        const patchnote = await prisma.patchNote.findUnique({
            where: { id: parseInt(id.toString()) },
        });

        if (!patchnote) {
            return null;
        }

        return patchnote;
  } catch (error) {
        console.error("An error occurred while fetching the patchnote", error);
        return null;
  }
}

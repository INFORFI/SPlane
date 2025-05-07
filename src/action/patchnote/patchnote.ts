'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PatchNote } from '@prisma/client';

type PatchNoteParsed = PatchNote & {
  parsedContent: any;
}

// Check if user has any unread patchnotes
export async function checkUnreadPatchnotes(userId: number): Promise<PatchNoteParsed[]> {
  if (!userId) {
    return [];
  }

  try {
    // Find all published patchnotes that the user hasn't viewed yet
    const unreadPatchnotes = await prisma.patchNote.findMany({
      where: {
        published: true,
        // No view record for this user
        userViews: {
          none: {
            userId: userId
          }
        }
      },
      orderBy: {
        releaseDate: 'desc',
      }
    });

    if (!unreadPatchnotes.length) {
      return [];
    }

    // Transform the patchnotes to match the expected interface
    return unreadPatchnotes.map(note => ({
      id: note.id,
      version: note.version,
      title: note.title,
      description: note.description,
      emoji: note.emoji || '✨',
      releaseDate: note.releaseDate,
      content: note.content,
      published: note.published,
      // Parse the content to make it easier to use in the client
      parsedContent: JSON.parse(note.content)
    }));
  } catch (error) {
    console.error('Error checking unread patchnotes:', error);
    return [];
  }
}

// Mark a patchnote as read for a specific user
export async function markPatchnoteAsRead(patchNoteId: number, userId: number): Promise<boolean> {
  if (!userId || !patchNoteId) {
    return false;
  }

  try {
    // Create a view record for this user and patchnote
    await prisma.patchNoteView.create({
      data: {
        userId: userId,
        patchNoteId: patchNoteId,
      }
    });

    // Revalidate the dashboard page to update any UI that depends on patchnote status
    revalidatePath('/dashboard');
    
    return true;
  } catch (error) {
    console.error('Error marking patchnote as read:', error);
    return false;
  }
}

// Get all patchnotes
export async function getAllPatchnotes(): Promise<PatchNoteParsed[]> {
  try {
    const patchnotes = await prisma.patchNote.findMany({
      where: {
        published: true
      },
      orderBy: {
        releaseDate: 'desc'
      }
    });

    return patchnotes.map(note => ({
      id: note.id,
      version: note.version,
      title: note.title,
      description: note.description,
      emoji: note.emoji || '✨',
      releaseDate: note.releaseDate,
      content: note.content,
      published: note.published,
      parsedContent: JSON.parse(note.content)
    }));
  } catch (error) {
    console.error('Error fetching patchnotes:', error);
    return [];
  }
}
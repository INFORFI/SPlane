import {
  checkUnreadPatchnotes,
  markPatchnoteAsRead,
  getAllPatchnotes,
} from '@/action/patchnote/patchnote';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockFindMany = jest.fn();
  const mockCreate = jest.fn();

  return {
    prisma: {
      patchNote: {
        findMany: mockFindMany,
      },
      patchNoteView: {
        create: mockCreate,
      },
    },
  };
});

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Patch Note Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkUnreadPatchnotes', () => {
    it('should return empty array if userId is not provided', async () => {
      const result = await checkUnreadPatchnotes(0);

      expect(result).toEqual([]);
      expect(prisma.patchNote.findMany).not.toHaveBeenCalled();
    });

    it('should return empty array if no unread patchnotes are found', async () => {
      // Mock empty result
      (prisma.patchNote.findMany as jest.Mock).mockResolvedValue([]);

      const result = await checkUnreadPatchnotes(1);

      expect(result).toEqual([]);
      expect(prisma.patchNote.findMany).toHaveBeenCalledWith({
        where: {
          published: true,
          userViews: {
            none: {
              userId: 1,
            },
          },
        },
        orderBy: {
          releaseDate: 'desc',
        },
      });
    });

    it('should return transformed patchnotes when unread patchnotes exist', async () => {
      // Mock patchnotes with valid JSON content
      const mockPatchnotes = [
        {
          id: 1,
          version: '1.0.0',
          title: 'First Release',
          description: 'Initial release',
          emoji: '🚀',
          releaseDate: new Date('2023-01-01'),
          content: JSON.stringify({ sections: [{ title: 'New Features', items: ['Feature 1'] }] }),
          published: true,
        },
        {
          id: 2,
          version: '1.1.0',
          title: 'Second Release',
          description: 'Bug fixes',
          emoji: null, // Test default emoji
          releaseDate: new Date('2023-02-01'),
          content: JSON.stringify({ sections: [{ title: 'Bug Fixes', items: ['Fix 1'] }] }),
          published: true,
        },
      ];

      (prisma.patchNote.findMany as jest.Mock).mockResolvedValue(mockPatchnotes);

      const result = await checkUnreadPatchnotes(1);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].emoji).toBe('🚀');
      expect(result[0].releaseDate.toISOString()).toBe('2023-01-01T00:00:00.000Z');
      expect(result[0].parsedContent).toEqual({
        sections: [{ title: 'New Features', items: ['Feature 1'] }],
      });

      expect(result[1].id).toBe(2);
      expect(result[1].emoji).toBe('✨'); // Default emoji
    });

    it('should handle errors and return empty array', async () => {
      // Mock error
      (prisma.patchNote.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await checkUnreadPatchnotes(1);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error checking unread patchnotes:',
        expect.any(Error)
      );
    });

    it('should handle invalid JSON content', async () => {
      // Mock patchnote with invalid JSON content
      const mockPatchnotes = [
        {
          id: 1,
          version: '1.0.0',
          title: 'Invalid JSON',
          description: 'This has invalid JSON',
          emoji: '🐛',
          releaseDate: new Date('2023-01-01'),
          content: '{invalid-json',
          published: true,
        },
      ];

      (prisma.patchNote.findMany as jest.Mock).mockResolvedValue(mockPatchnotes);

      const result = await checkUnreadPatchnotes(1);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('markPatchnoteAsRead', () => {
    it('should return false if userId or patchNoteId is not provided', async () => {
      const result1 = await markPatchnoteAsRead(0, 1);
      const result2 = await markPatchnoteAsRead(1, 0);
      const result3 = await markPatchnoteAsRead(0, 0);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
      expect(prisma.patchNoteView.create).not.toHaveBeenCalled();
    });

    it('should create a view record and return true on success', async () => {
      // Mock successful creation
      (prisma.patchNoteView.create as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 1,
        patchNoteId: 1,
        viewedAt: new Date(),
      });

      const result = await markPatchnoteAsRead(1, 1);

      expect(result).toBe(true);
      expect(prisma.patchNoteView.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          patchNoteId: 1,
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle errors and return false', async () => {
      // Mock error
      (prisma.patchNoteView.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await markPatchnoteAsRead(1, 1);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Error marking patchnote as read:',
        expect.any(Error)
      );
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('getAllPatchnotes', () => {
    it('should return all published patchnotes', async () => {
      // Mock patchnotes
      const mockPatchnotes = [
        {
          id: 1,
          version: '1.0.0',
          title: 'First Release',
          description: 'Initial release',
          emoji: '🚀',
          releaseDate: new Date('2023-01-01'),
          content: JSON.stringify({ sections: [{ title: 'New Features', items: ['Feature 1'] }] }),
          published: true,
        },
        {
          id: 2,
          version: '1.1.0',
          title: 'Second Release',
          description: 'Bug fixes',
          emoji: null,
          releaseDate: new Date('2023-02-01'),
          content: JSON.stringify({ sections: [{ title: 'Bug Fixes', items: ['Fix 1'] }] }),
          published: true,
        },
      ];

      (prisma.patchNote.findMany as jest.Mock).mockResolvedValue(mockPatchnotes);

      const result = await getAllPatchnotes();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].parsedContent).toEqual({
        sections: [{ title: 'New Features', items: ['Feature 1'] }],
      });
      expect(result[1].emoji).toBe('✨'); // Default emoji

      expect(prisma.patchNote.findMany).toHaveBeenCalledWith({
        where: {
          published: true,
        },
        orderBy: {
          releaseDate: 'desc',
        },
      });
    });

    it('should handle errors and return empty array', async () => {
      // Mock error
      (prisma.patchNote.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getAllPatchnotes();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error fetching patchnotes:', expect.any(Error));
    });

    it('should handle invalid JSON content', async () => {
      // Mock patchnote with invalid JSON content
      const mockPatchnotes = [
        {
          id: 1,
          version: '1.0.0',
          title: 'Invalid JSON',
          description: 'This has invalid JSON',
          emoji: '🐛',
          releaseDate: new Date('2023-01-01'),
          content: '{invalid-json',
          published: true,
        },
      ];

      (prisma.patchNote.findMany as jest.Mock).mockResolvedValue(mockPatchnotes);

      const result = await getAllPatchnotes();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });
});

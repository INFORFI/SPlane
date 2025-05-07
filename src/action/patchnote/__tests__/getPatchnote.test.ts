import getPatchnote from '@/action/patchnote/getPatchnote';
import { prisma } from '@/lib/prisma';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockFindUnique = jest.fn();
  
  return {
    prisma: {
      patchNote: {
        findUnique: mockFindUnique
      }
    }
  };
});

describe('getPatchnote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a patchnote when found with numeric id', async () => {
    // Mock patchnote data
    const mockPatchnote = {
      id: 123,
      title: 'Test Patch Note',
      content: 'Test Content',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Setup mock to return the patchnote
    (prisma.patchNote.findUnique as jest.Mock).mockResolvedValue(mockPatchnote);

    const result = await getPatchnote(123);

    expect(result).toEqual(mockPatchnote);
    expect(prisma.patchNote.findUnique).toHaveBeenCalledWith({
      where: { id: 123 },
    });
  });

  it('should return a patchnote when found with string id', async () => {
    // Mock patchnote data
    const mockPatchnote = {
      id: 123,
      title: 'Test Patch Note',
      content: 'Test Content',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Setup mock to return the patchnote
    (prisma.patchNote.findUnique as jest.Mock).mockResolvedValue(mockPatchnote);

    const result = await getPatchnote('123');

    expect(result).toEqual(mockPatchnote);
    expect(prisma.patchNote.findUnique).toHaveBeenCalledWith({
      where: { id: 123 },
    });
  });

  it('should return null when patchnote is not found', async () => {
    // Setup mock to return null (patchnote not found)
    (prisma.patchNote.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getPatchnote('999');

    expect(result).toBeNull();
    expect(prisma.patchNote.findUnique).toHaveBeenCalledWith({
      where: { id: 999 },
    });
  });

  it('should handle invalid id format gracefully', async () => {
    // Setup mock to throw an error for invalid id
    (prisma.patchNote.findUnique as jest.Mock).mockRejectedValue(
      new Error('Invalid id format')
    );

    const result = await getPatchnote('invalid-id');

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      'An error occurred while fetching the patchnote',
      expect.any(Error)
    );
  });

  it('should handle database errors gracefully', async () => {
    // Setup mock to throw a database error
    (prisma.patchNote.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database connection error')
    );

    const result = await getPatchnote('123');

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      'An error occurred while fetching the patchnote',
      expect.any(Error)
    );
  });
}); 
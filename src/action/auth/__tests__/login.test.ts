import { login } from '@/action/auth/login';
import { compare } from 'bcryptjs';
import { cookies } from 'next/headers';
import { createSessionToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Mocks
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('next/headers', () => {
  const mockSet = jest.fn();
  return {
    cookies: jest.fn(() => ({
      set: mockSet,
    })),
  };
});

jest.mock('@/lib/auth', () => ({
  createSessionToken: jest.fn(),
}));

jest.mock('@/lib/prisma', () => {
  const mockFindUnique = jest.fn();
  
  return {
    prisma: {
      user: {
        findUnique: mockFindUnique,
      },
    },
  };
});

describe('login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return error if email is missing', async () => {
    const result = await login('', 'password123');

    expect(result).toEqual({ error: 'Email et mot de passe sont requis' });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return error if password is missing', async () => {
    const result = await login('user@example.com', '');

    expect(result).toEqual({ error: 'Email et mot de passe sont requis' });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return error if user is not found', async () => {
    // Mock user not found
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await login('nonexistent@example.com', 'password123');

    expect(result).toEqual({ error: 'Utilisateur non trouvé' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'nonexistent@example.com' },
    });
    expect(compare).not.toHaveBeenCalled();
  });

  it('should return error if password is incorrect', async () => {
    // Mock user found
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      passwordHash: 'hashedPassword',
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    
    // Mock password comparison to fail
    (compare as jest.Mock).mockResolvedValue(false);

    const result = await login('user@example.com', 'wrongPassword');

    expect(result).toEqual({ error: 'Mot de passe incorrect' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
    expect(compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
    expect(createSessionToken).not.toHaveBeenCalled();
  });

  it('should login successfully and set session cookie', async () => {
    // Mock user found
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      passwordHash: 'hashedPassword',
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    
    // Mock password comparison to succeed
    (compare as jest.Mock).mockResolvedValue(true);
    
    // Mock token creation
    (createSessionToken as jest.Mock).mockResolvedValue('mock-session-token');
    
    // Mock cookie store
    const mockCookieStore = { set: jest.fn() };
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);

    const result = await login('user@example.com', 'correctPassword');

    expect(result).toEqual({ success: 'Connexion réussie' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
    expect(compare).toHaveBeenCalledWith('correctPassword', 'hashedPassword');
    expect(createSessionToken).toHaveBeenCalledWith(1);
    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.set).toHaveBeenCalledWith({
      name: 'session_token',
      value: 'mock-session-token',
      httpOnly: true,
      path: '/',
      secure: expect.any(Boolean),
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      sameSite: 'strict',
    });
  });

  it('should handle database errors', async () => {
    // Mock database error
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const result = await login('user@example.com', 'password123');

    expect(result).toEqual({ error: 'Une erreur est survenue lors de la connexion' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle bcrypt compare errors', async () => {
    // Mock user found
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      passwordHash: 'hashedPassword',
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    
    // Mock bcrypt error
    (compare as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));

    const result = await login('user@example.com', 'password123');

    expect(result).toEqual({ error: 'Une erreur est survenue lors de la connexion' });
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle token creation errors', async () => {
    // Mock user found
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      passwordHash: 'hashedPassword',
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    
    // Mock password comparison to succeed
    (compare as jest.Mock).mockResolvedValue(true);
    
    // Mock token creation error
    (createSessionToken as jest.Mock).mockRejectedValue(new Error('Token creation error'));

    const result = await login('user@example.com', 'correctPassword');

    expect(result).toEqual({ error: 'Une erreur est survenue lors de la connexion' });
    expect(console.error).toHaveBeenCalled();
  });
}); 
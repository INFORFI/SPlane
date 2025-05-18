import { logout } from '@/action/auth/logout';
import { cookies } from 'next/headers';

// Mock next/headers
jest.mock('next/headers', () => {
  const mockDelete = jest.fn();

  return {
    cookies: jest.fn(() => ({
      delete: mockDelete,
    })),
  };
});

describe('logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should delete session cookie and return success', async () => {
    // Mock cookies function
    const mockCookieStore = {
      delete: jest.fn(),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);

    const result = await logout();

    expect(result).toEqual({ success: true });
    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.delete).toHaveBeenCalledWith({
      name: 'session_token',
      path: '/',
    });
  });

  it('should handle errors when deleting cookie', async () => {
    // Mock cookies function to throw an error
    const mockError = new Error('Failed to delete cookie');
    (cookies as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const result = await logout();

    expect(result).toEqual({
      success: false,
      error: 'Une erreur est survenue lors de la déconnexion',
    });
    expect(console.error).toHaveBeenCalledWith('Erreur lors de la déconnexion:', mockError);
  });

  it('should handle errors from cookieStore.delete', async () => {
    // Mock cookies function
    const mockCookieStore = {
      delete: jest.fn().mockImplementation(() => {
        throw new Error('Cookie deletion failed');
      }),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);

    const result = await logout();

    expect(result).toEqual({
      success: false,
      error: 'Une erreur est survenue lors de la déconnexion',
    });
    expect(console.error).toHaveBeenCalledWith('Erreur lors de la déconnexion:', expect.any(Error));
  });

  it('should handle unexpected error types', async () => {
    // Mock cookies function to throw a non-Error object
    (cookies as jest.Mock).mockImplementation(() => {
      throw 'Unexpected error';
    });

    const result = await logout();

    expect(result).toEqual({
      success: false,
      error: 'Une erreur est survenue lors de la déconnexion',
    });
    expect(console.error).toHaveBeenCalledWith(
      'Erreur lors de la déconnexion:',
      'Unexpected error'
    );
  });
});

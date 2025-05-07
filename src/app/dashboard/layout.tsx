import { ReactNode } from 'react';
import { User, LogOut } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { logout } from '@/action/auth/logout';
import { redirect } from 'next/navigation';
import { getUserLoggedIn } from '@/action/users/getUserLoggedIn';
import PatchnoteChecker from '@/components/patchnote/PatchnoteChecker';
import { checkUnreadPatchnotes } from '@/action/patchnote/patchnote';
import PatchnotesDropdown from '@/components/patchnote/PatchnotesDropdown';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getUserLoggedIn();

  if (!user) {
    redirect('/login');
  }

  const unreadPatchnotes = await checkUnreadPatchnotes(user?.id);

  async function handleLogout() {
    'use server';
    await logout();
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Top navigation */}
        <header className="h-16 border-b border-[var(--border)] bg-[var(--background-secondary)] flex items-center justify-between px-6">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-9 px-4 py-2 bg-[var(--input)] border border-[var(--border-secondary)] rounded-md text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
            />
          </div>

          {/* User actions */}
          <div className="flex items-center gap-4">
            <PatchnotesDropdown patchnotes={unreadPatchnotes} />

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-[var(--foreground-secondary)]">
                  {user?.fullName}
                </span>
                <span className="text-xs text-[var(--foreground-tertiary)]">{user?.email}</span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
                <User className="h-5 w-5" />
              </div>
            </div>

            <form action={handleLogout}>
              <button
                type="submit"
                className="p-2 rounded-md text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        {/* Main content */}
        <main
          className="flex-1 overflow-auto p-6 bg-[var(--background)] 
          [&::-webkit-scrollbar]:w-2 
          [&::-webkit-scrollbar-track]:bg-[var(--background-secondary)] 
          [&::-webkit-scrollbar-thumb]:bg-[var(--border-secondary)] 
          [&::-webkit-scrollbar-thumb:hover]:bg-[var(--primary)]"
        >
          {user.settings.notifications_patch_notes ? <PatchnoteChecker /> : null}

          {children}
        </main>
      </div>
    </div>
  );
}

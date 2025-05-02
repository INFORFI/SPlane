import React from 'react';
import { User, LogOut } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { logout } from '@/action/auth/logout';
import { redirect } from 'next/navigation';
import { getUserLoggedIn } from '@/action/users/getUserLoggedIn';
import PatchnoteChecker from '@/components/patchnote/PatchnoteChecker';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const user = await getUserLoggedIn();

  async function handleLogout() {
    "use server";
    await logout();
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Top navigation */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-6">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-9 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* User actions */}
          <div className="flex items-center gap-4">
            {/*
            <button className="p-2 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>
            */}

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-zinc-200">{user?.fullName}</span>
                <span className="text-xs text-zinc-400">{user?.email}</span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white">
                <User className="h-5 w-5" />
              </div>
            </div>

            <form action={handleLogout}>
              <button type="submit" className="p-2 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        {/* Main content */}
        <main
          className="flex-1 overflow-auto p-6 bg-zinc-950 
          [&::-webkit-scrollbar]:w-2 
          [&::-webkit-scrollbar-track]:bg-zinc-900 
          [&::-webkit-scrollbar-thumb]:bg-zinc-700 
          [&::-webkit-scrollbar-thumb:hover]:bg-indigo-600"
        >
          <PatchnoteChecker />

          {children}
        </main>
      </div>
    </div>
  );
}

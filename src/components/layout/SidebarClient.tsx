'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckSquare,
  Home,
  Layers,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
};

type SidebarProps = {
  tasksCount: number;
};

export default function Sidebar({ tasksCount }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Projects', href: '/dashboard/projects', icon: <Layers className="h-5 w-5" /> },
    {
      name: 'Tasks',
      href: '/dashboard/tasks',
      icon: <CheckSquare className="h-5 w-5" />,
      badge: tasksCount,
    },
    { name: 'Calendar', href: '/dashboard/calendar', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Team', href: '/dashboard/team', icon: <Users className="h-5 w-5" /> },
  ];

  const bottomNavItems: NavItem[] = [
    { name: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      className="flex flex-col h-screen bg-[var(--background-secondary)] text-[var(--foreground-secondary)] border-r border-[var(--border)] relative shadow-xl"
      animate={{
        width: isCollapsed ? '80px' : '240px',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Logo area */}
      <div className="flex items-center p-4 h-16 border-b border-[var(--border)]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] font-medium">
            S
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                className="font-bold text-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                SPLANE
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
        {mainNavItems.map(item => (
          <NavItem
            key={item.name}
            item={item}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
          />
        ))}

        {/* Quick add button */}
        <Link href="/dashboard/projects/create" className="px-3 mt-6">
          <motion.button
            className={`flex items-center gap-2 w-full rounded-md p-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-medium transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            whileTap={{ scale: 0.97 }}
          >
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      New Project
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        </Link>
      </div>

      {/* Bottom navigation */}
      <div className="border-t border-[var(--border)] py-4 flex flex-col gap-1">
        {bottomNavItems.map(item => (
          <NavItem
            key={item.name}
            item={item}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] text-[var(--foreground-secondary)] rounded-full p-1 shadow-md transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </motion.div>
  );
}

function NavItem({
  item,
  isActive,
  isCollapsed,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-md transition-colors relative ${
        isActive
          ? 'bg-[var(--background-tertiary)] text-[var(--primary)]'
          : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]/50'
      }`}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        {item.icon}
      </motion.div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            className="font-medium"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {item.name}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badge */}
      {item.badge ? (
        <div className={`absolute ${isCollapsed ? 'right-1' : 'right-3'} flex`}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-[var(--primary-foreground)]">
            {item.badge}
          </span>
        </div>
      ) : null}
    </Link>
  );
}

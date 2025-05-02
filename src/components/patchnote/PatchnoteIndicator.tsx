'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

interface PatchnoteIndicatorProps {
  count: number;
  isCollapsed?: boolean;
}

export default function PatchnoteIndicator({ count, isCollapsed = false }: PatchnoteIndicatorProps) {
  // Don't render anything if there are no unread patchnotes
  if (count <= 0) {
    return null;
  }

  return (
    <Link
      href="/dashboard/patchnotes"
      className={`flex items-center gap-3 px-3 py-2 mx-2 mb-1 rounded-md transition-all ${
        isCollapsed ? 'justify-center' : ''
      } bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 hover:text-indigo-300 relative`}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white"
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      </motion.div>

      {!isCollapsed && (
        <motion.span
          className="font-medium"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          Nouvelles mises à jour
        </motion.span>
      )}
    </Link>
  );
}
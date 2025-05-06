'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PatchNote } from '@prisma/client';
import { markPatchnoteAsRead } from '@/action/patchnote/patchnote';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PatchnotesDropdownProps {
  patchnotes: PatchNote[];
}

export default function PatchnotesDropdown({ patchnotes }: PatchnotesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format release date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePatchnoteClick = async (patchnoteId: number) => {
    setIsOpen(false);
    
    // Mark the patchnote as read when clicked
    try {
      await markPatchnoteAsRead(patchnoteId, 0); // The second argument will be replaced server-side
      router.refresh(); // Refresh the page to update the unread count
    } catch (error) {
      console.error('Error marking patchnote as read:', error);
    }
  };

  const hasUnreadPatchnotes = patchnotes?.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors relative cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {hasUnreadPatchnotes && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--primary)] rounded-full"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-auto bg-[var(--background-secondary)] rounded-lg border border-[var(--border)] shadow-xl z-50"
          >
            <div className="p-3 border-b border-[var(--border)]">
              <h3 className="font-medium text-[var(--foreground-secondary)]">Nouvelles mises à jour</h3>
              {hasUnreadPatchnotes && (
                <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
                  {patchnotes.length} note{patchnotes.length > 1 ? 's' : ''} de mise à jour non lue{patchnotes.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="py-2">
              {hasUnreadPatchnotes ? (
                patchnotes.map((note) => (
                  <Link href={`/dashboard/patchnotes/${note.id}`} key={note.id}>
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.1 }}
                      className="px-3 py-2 hover:bg-[var(--background-tertiary)] cursor-pointer transition-colors"
                      onClick={() => handlePatchnoteClick(note.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)]">
                          <span>{note.emoji || '✨'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--foreground-secondary)] flex items-center gap-2">
                            {note.title}
                            <span className="text-xs px-1.5 py-0.5 bg-[var(--primary-muted)] text-[var(--primary)] rounded-full">
                              v{note.version}
                            </span>
                          </p>
                          <p className="text-xs text-[var(--foreground-tertiary)] truncate mt-0.5">{note.description}</p>
                          <p className="text-xs text-[var(--foreground-muted)] mt-1">{new Date(note.releaseDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}</p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-[var(--foreground-tertiary)]">Aucune mise à jour non lue</p>
                </div>
              )}
            </div>
            
            {hasUnreadPatchnotes && (
              <div className="p-2 border-t border-[var(--border)]">
                <button 
                  className="w-full py-2 px-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-md text-sm font-medium text-[var(--primary-foreground)] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Marquer tout comme lu
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
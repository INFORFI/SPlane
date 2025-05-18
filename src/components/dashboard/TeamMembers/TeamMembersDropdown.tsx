'use client';

import { useEffect, useState, useRef } from 'react';
import { User } from '@prisma/client';
import { CheckCircle2 } from 'lucide-react';

export default function TeamMembersDropdown({
  isOpen,
  users,
  selectedMembers,
  toggleMember,
  anchorRef,
  onClose,
}: {
  isOpen: boolean;
  users: User[];
  selectedMembers: number[];
  toggleMember: (userId: number) => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) ||
          (anchorRef.current && anchorRef.current.contains(event.target as Node))
        ) {
          return;
        }
        onClose();
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    } else {
      setSearchTerm('');
    }
  }, [isOpen, anchorRef, onClose]);

  if (!isOpen) return null;

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      ref={dropdownRef}
      className="dropdown-container z-[9999] bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg shadow-2xl max-h-80 overflow-y-auto"
    >
      <div className="sticky top-0 p-2 bg-[var(--background-tertiary)] border-b border-[var(--border-secondary)] z-10">
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search team members..."
          className="w-full px-3 py-2 bg-[var(--input)] border border-[var(--border-secondary)] rounded-md text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent text-sm"
          onClick={e => e.stopPropagation()}
        />
      </div>
      <div className="p-2">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <div
              key={user.id}
              className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer ${
                selectedMembers.includes(user.id)
                  ? 'bg-[var(--primary-muted)] text-[var(--primary)]'
                  : 'hover:bg-[var(--background-tertiary)]/50 text-[var(--foreground-secondary)]'
              }`}
              onClick={() => toggleMember(user.id)}
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-sm">
                  {user.fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </div>
                <span>{user.fullName}</span>
              </div>
              {selectedMembers.includes(user.id) && <CheckCircle2 className="h-4 w-4" />}
            </div>
          ))
        ) : (
          <div className="px-3 py-2 text-[var(--foreground-muted)] text-center">
            Aucun membre trouvé correspondant à &quot;{searchTerm}&quot;
          </div>
        )}
      </div>
    </div>
  );
}

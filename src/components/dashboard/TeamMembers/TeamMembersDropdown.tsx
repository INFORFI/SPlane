'use client';

import { useEffect, useState, useRef } from 'react';
import { User } from '@prisma/client';
import { createPortal } from 'react-dom';
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
      className="dropdown-container z-[9999] bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl max-h-80 overflow-y-auto"
    >
      <div className="sticky top-0 p-2 bg-zinc-800 border-b border-zinc-700 z-10">
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search team members..."
          className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
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
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'hover:bg-zinc-700/50 text-zinc-300'
              }`}
              onClick={() => toggleMember(user.id)}
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm">
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
          <div className="px-3 py-2 text-zinc-500 text-center">
            No members found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}

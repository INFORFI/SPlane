import { User } from '@prisma/client';
import TeamMembersDropdown from './TeamMembersDropdown';
import { X } from 'lucide-react';
import { useRef, useState } from 'react';

export default function TeamMember({
  users,
  formData,
  toggleTeamMember,
}: {
  users: User[];
  formData: {
    teamMembers: number[];
  };
  toggleTeamMember: (userId: number) => void;
}) {
  const [isTeamSelectOpen, setIsTeamSelectOpen] = useState(false);
  const teamSelectorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--foreground-secondary)]">
        Team Members
      </label>

      <div>
        <div
          className="flex flex-wrap gap-2 min-h-12 p-3 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg cursor-pointer"
          onClick={() => setIsTeamSelectOpen(!isTeamSelectOpen)}
          ref={teamSelectorRef}
        >
          {formData.teamMembers.length > 0 ? (
            formData.teamMembers.map((userId: number) => {
              const user = users.find(u => u.id === userId);
              return user ? (
                <div
                  key={user.id}
                  className="flex items-center gap-1 bg-[var(--primary-muted)] text-[var(--primary)] px-2 py-1 rounded-full text-sm"
                >
                  <span>{user.fullName}</span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      toggleTeamMember(user.id);
                    }}
                    className="text-[var(--primary)] hover:text-[var(--primary-hover)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : null;
            })
          ) : (
            <div className="text-[var(--foreground-muted)] py-1">No team members selected</div>
          )}
        </div>

        <TeamMembersDropdown
          isOpen={isTeamSelectOpen}
          users={users}
          selectedMembers={formData.teamMembers}
          toggleMember={toggleTeamMember}
          anchorRef={teamSelectorRef}
          onClose={() => setIsTeamSelectOpen(false)}
        />
      </div>
      <p className="text-[var(--foreground-muted)] text-xs mt-1">
        Les membres du projet auront accès au projet mais ne seront pas assignés automatiquement aux
        tâches
      </p>
    </div>
  );
}

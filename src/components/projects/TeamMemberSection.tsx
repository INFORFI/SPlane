'use client';

import { TaskStatus } from '@prisma/client';
import { Users } from 'lucide-react';
import { ProjectWithDetails } from '@/action/projects/getProjectById';

export default function TeamMemberSection({ project }: { project: ProjectWithDetails }) {
  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Équipe</h2>
      </div>

      <div className="space-y-3">
        {project.teamMembers.length > 0 ? (
          project.teamMembers.map(member => {
            const currentTask = project.tasks.find(
              task =>
                task.status === TaskStatus.IN_PROGRESS &&
                task.userTasks.some(userTask => userTask.user.id === member.id)
            );

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 hover:bg-[var(--background-tertiary)]/50 rounded-lg transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-sm font-medium">
                  {member.fullName
                    .split(' ')
                    .map(name => name[0])
                    .join('')}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">{member.fullName}</p>
                  <p className="text-xs text-[var(--foreground-tertiary)]">{member.email}</p>
                  {currentTask && (
                    <div className="mt-1 flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-[var(--warning)]"></div>
                      <p className="text-xs text-[var(--warning)] font-medium">
                        En cours: {currentTask.title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6">
            <Users className="h-8 w-8 text-[var(--foreground-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--foreground-muted)]">Aucun membre assigné</p>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { deleteProject } from '@/action/projects/deleteProject';

interface DeleteProjectModalProps {
  projectId: number;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteProjectModal({
  projectId,
  projectName,
  isOpen,
  onClose,
}: DeleteProjectModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteProject(projectId);

      if (result.success) {
        toast.success(result.message);
        onClose();
        router.push('/dashboard/projects');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de la suppression du projet');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3 text-[var(--error)]">
            <AlertTriangle className="h-6 w-6" />
            <h3 className="text-xl font-semibold">Supprimer le projet</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] transition-colors cursor-pointer"
            disabled={isDeleting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-[var(--foreground-secondary)]">
            Êtes-vous sûr de vouloir supprimer le projet{' '}
            <span className="font-semibold text-[var(--foreground)]">{projectName}</span> ?
          </p>

          <div className="bg-[var(--error-muted)] border border-[var(--error)]/20 rounded-lg p-4 text-sm text-[var(--error)]">
            <p>
              <strong>Attention :</strong> Cette action est irréversible et supprimera également
              toutes les tâches associées à ce projet.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] rounded-lg text-sm font-medium text-[var(--foreground-secondary)] transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isDeleting}
            >
              Annuler
            </motion.button>

            <motion.button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--error)] hover:bg-[var(--error)] rounded-lg text-sm font-medium text-[var(--error-foreground)] transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Suppression...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Supprimer</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

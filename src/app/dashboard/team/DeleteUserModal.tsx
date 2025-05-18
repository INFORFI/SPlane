'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';
import { User } from '@prisma/client';
import { deleteUser } from '@/action/users/manageUsers';
import { toast } from 'react-toastify';

interface DeleteUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteUserModal({ user, isOpen, onClose }: DeleteUserModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const result = await deleteUser(user.id);

      if (result.success) {
        toast.success(`${user.fullName} a été supprimé avec succès`);
        onClose();
      } else {
        toast.error(result.error || 'Une erreur est survenue lors de la suppression');
      }
    } catch (error) {
      console.error(error);
      toast.error('Une erreur est survenue lors de la suppression');
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
        <div className="flex items-center gap-3 text-[var(--error)] mb-6">
          <AlertTriangle className="h-6 w-6" />
          <h3 className="text-xl font-semibold">Supprimer un membre</h3>
          <button
            onClick={onClose}
            className="ml-auto text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] transition-colors cursor-pointer"
            disabled={isDeleting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-[var(--foreground-secondary)]">
            Êtes-vous sûr de vouloir supprimer le membre{' '}
            <span className="font-semibold text-[var(--foreground)]">{user.fullName}</span> ?
          </p>

          <div className="bg-[var(--error-muted)] border border-[var(--error)]/20 rounded-lg p-4 text-sm text-[var(--error)]">
            <p>
              <strong>Attention :</strong> Cette action est irréversible. Les projets et les tâches
              auxquels ce membre est associé ne seront pas supprimés.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] rounded-lg text-sm font-medium text-[var(--foreground-secondary)] transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Annuler
            </motion.button>

            <motion.button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--error)] hover:bg-[var(--error)]/80 rounded-lg text-sm font-medium text-[var(--error-foreground)] transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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

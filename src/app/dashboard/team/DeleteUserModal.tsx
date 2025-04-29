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
        toast.error(result.error || "Une erreur est survenue lors de la suppression");
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue lors de la suppression");
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
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-rose-500 mb-6">
          <AlertTriangle className="h-6 w-6" />
          <h3 className="text-xl font-semibold">Supprimer un membre</h3>
          <button
            onClick={onClose}
            className="ml-auto text-zinc-400 hover:text-zinc-300 transition-colors"
            disabled={isDeleting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-zinc-300">
            Êtes-vous sûr de vouloir supprimer le membre{' '}
            <span className="font-semibold text-white">{user.fullName}</span> ?
          </p>

          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-sm text-rose-300">
            <p>
              <strong>Attention :</strong> Cette action est irréversible. Les projets et les tâches auxquels ce membre est associé ne seront pas supprimés.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Annuler
            </motion.button>

            <motion.button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-sm font-medium text-white transition-colors"
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
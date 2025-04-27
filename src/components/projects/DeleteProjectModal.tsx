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
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3 text-rose-500">
            <AlertTriangle className="h-6 w-6" />
            <h3 className="text-xl font-semibold">Supprimer le projet</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer"
            disabled={isDeleting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-zinc-300">
            Êtes-vous sûr de vouloir supprimer le projet{' '}
            <span className="font-semibold text-white">{projectName}</span> ?
          </p>

          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-sm text-rose-300">
            <p>
              <strong>Attention :</strong> Cette action est irréversible et supprimera également
              toutes les tâches associées à ce projet.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-200 transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isDeleting}
            >
              Annuler
            </motion.button>

            <motion.button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer"
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

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User as UserIcon, Mail, Shield, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { User, Role } from '@prisma/client';
import { toast } from 'react-toastify';
import { createUser, updateUser } from '@/action/users/manageUsers';

interface AddUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddUserModal({ user, isOpen, onClose }: AddUserModalProps) {
  const isEditing = !!user;
  
  // Form state
  const [formData, setFormData] = useState({
    id: user?.id || 0,
    email: user?.email || '',
    fullName: user?.fullName || '',
    role: user?.role || Role.USER,
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: user?.id || 0,
        email: user?.email || '',
        fullName: user?.fullName || '',
        role: user?.role || Role.USER,
        password: '',
        confirmPassword: '',
      });
      setErrors({});
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen, user]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }
    
    if (!formData.fullName) {
      newErrors.fullName = "Le nom complet est requis";
    }
    
    if (!isEditing) {
      // Only validate password for new users
      if (!formData.password) {
        newErrors.password = "Le mot de passe est requis";
      } else if (formData.password.length < 8) {
        newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    } else if (formData.password) {
      // If editing and password is provided, validate it
      if (formData.password.length < 8) {
        newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        // Update existing user
        const result = await updateUser({
          id: formData.id,
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          password: formData.password || undefined, // Only send password if provided
        });
        
        if (result.success) {
          setSuccess(true);
          toast.success("Utilisateur mis à jour avec succès");
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          toast.error(result.error || "Une erreur est survenue");
          if (result.fieldErrors) {
            setErrors(result.fieldErrors);
          }
        }
      } else {
        // Create new user
        const result = await createUser({
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          password: formData.password,
        });
        
        if (result.success) {
          setSuccess(true);
          toast.success("Utilisateur créé avec succès");
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          toast.error(result.error || "Une erreur est survenue");
          if (result.fieldErrors) {
            setErrors(result.fieldErrors);
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? 'Modifier un membre' : 'Ajouter un membre'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </motion.div>
            <h3 className="text-lg font-medium text-white mb-2">
              {isEditing ? 'Membre mis à jour' : 'Membre ajouté'}
            </h3>
            <p className="text-zinc-400 mb-4">
              {isEditing
                ? `Les informations de ${formData.fullName} ont été mises à jour avec succès.`
                : `${formData.fullName} a été ajouté à l'équipe.`}
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name field */}
            <div className="space-y-1">
              <label htmlFor="fullName" className="block text-sm font-medium text-zinc-300">
                Nom complet <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  className={`w-full pl-10 pr-3 py-2 bg-zinc-800 border ${
                    errors.fullName ? 'border-rose-500' : 'border-zinc-700'
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.fullName && (
                <p className="text-rose-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email field */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jean.dupont@example.com"
                  className={`w-full pl-10 pr-3 py-2 bg-zinc-800 border ${
                    errors.email ? 'border-rose-500' : 'border-zinc-700'
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-rose-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Role field */}
            <div className="space-y-1">
              <label htmlFor="role" className="block text-sm font-medium text-zinc-300">
                Rôle
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-zinc-500" />
                </div>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                  disabled={isSubmitting}
                >
                  <option value={Role.USER}>Utilisateur</option>
                  <option value={Role.ADMIN}>Administrateur</option>
                </select>
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                {isEditing ? 'Nouveau mot de passe' : 'Mot de passe'}{' '}
                {!isEditing && <span className="text-rose-500">*</span>}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isEditing ? '••••••••' : 'Minimum 8 caractères'}
                className={`w-full px-4 py-2 bg-zinc-800 border ${
                  errors.password ? 'border-rose-500' : 'border-zinc-700'
                } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-rose-500 text-xs mt-1">{errors.password}</p>
              )}
              {isEditing && (
                <p className="text-zinc-500 text-xs mt-1">
                  Laissez vide pour conserver le mot de passe actuel
                </p>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">
                Confirmer le mot de passe
                {!isEditing && <span className="text-rose-500">*</span>}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2 bg-zinc-800 border ${
                  errors.confirmPassword ? 'border-rose-500' : 'border-zinc-700'
                } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="text-rose-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Error message */}
            {errors.general && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <motion.button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-200 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Annuler
              </motion.button>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-70 cursor-pointer"
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isEditing ? 'Mise à jour...' : 'Création...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{isEditing ? 'Mettre à jour' : 'Créer'}</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
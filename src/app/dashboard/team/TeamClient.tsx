'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Shield, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
} from 'lucide-react';
import { User } from '@prisma/client';
import { toast } from 'react-toastify';
import AddUserModal from './AddUserModal';
import DeleteUserModal from './DeleteUserModal';
import { containerVariants, itemVariants } from '@/utils/ItemVariants';

interface TeamClientProps {
  users: User[];
  currentUserId: number;
}

export default function TeamClient({ users, currentUserId }: TeamClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUserData] = useState<User | undefined>(
    users.find(user => user.id === currentUserId)
  );
  
  // Check if current user is admin
  const isAdmin = currentUserData?.role === 'ADMIN';

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    let matchesSearch = true;
    let matchesRole = true;

    if (searchQuery) {
      matchesSearch = 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
    }

    if (roleFilter !== 'all') {
      matchesRole = user.role === roleFilter;
    }

    return matchesSearch && matchesRole;
  });

  // Handle user deletion
  const handleDeleteUser = (user: User) => {
    if (user.id === currentUserId) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte");
      return;
    }
    
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Handle user edit
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowAddModal(true);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-white">Équipe</h1>
          <p className="text-zinc-400">Gérez les membres de votre équipe SPLANE</p>
        </motion.div>

        {isAdmin && (
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedUser(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un membre</span>
          </motion.button>
        )}
      </div>

      {/* Search and filters */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">Tous les rôles</option>
            <option value="ADMIN">Administrateurs</option>
            <option value="USER">Utilisateurs</option>
          </select>
        </div>
      </motion.div>

      {/* Team members grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredUsers.map(user => (
            <TeamMemberCard
              key={user.id}
              user={user}
              isCurrentUser={user.id === currentUserId}
              isAdmin={isAdmin}
              formatDate={formatDate}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filteredUsers.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center p-8 bg-zinc-900 border border-zinc-800 rounded-xl"
        >
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <UserIcon className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-300 mb-2">Aucun membre trouvé</h3>
          <p className="text-zinc-500 text-center mb-6 max-w-md">
            {searchQuery || roleFilter !== 'all'
              ? "Aucun membre ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres."
              : "Votre équipe n'a pas encore de membres. Commencez par en ajouter un."}
          </p>
          {isAdmin && !searchQuery && roleFilter === 'all' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedUser(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter un membre</span>
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddUserModal
            user={selectedUser}
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete User Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
          <DeleteUserModal
            user={selectedUser}
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface TeamMemberCardProps {
  user: User;
  isCurrentUser: boolean;
  isAdmin: boolean;
  formatDate: (date: Date) => string;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

function TeamMemberCard({ 
  user, 
  isCurrentUser, 
  isAdmin, 
  formatDate, 
  onEdit, 
  onDelete 
}: TeamMemberCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col relative"
    >
      {isCurrentUser && (
        <div className="absolute top-4 right-4 px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-full">
          Vous
        </div>
      )}
      
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-medium">
              {user.fullName
                .split(' ')
                .map(name => name[0])
                .join('')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{user.fullName}</h3>
              <div className="flex items-center gap-1 text-zinc-400 text-sm">
                <Mail className="h-3 w-3" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          {isAdmin && !isCurrentUser && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowActions(!showActions)}
                className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <MoreHorizontal className="h-5 w-5" />
              </motion.button>

              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-10 w-32 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg overflow-hidden z-10"
                  >
                    <button 
                      onClick={() => {
                        setShowActions(false);
                        onEdit(user);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowActions(false);
                        onDelete(user);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Supprimer</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Shield className={`h-4 w-4 ${user.role === 'ADMIN' ? 'text-amber-500' : 'text-indigo-400'}`} />
            <span className={`${user.role === 'ADMIN' ? 'text-amber-400' : 'text-indigo-400'} font-medium`}>
              {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Calendar className="h-4 w-4 text-zinc-500" />
            <span>
              Membre depuis {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-zinc-400 hover:text-indigo-400 transition-colors cursor-not-allowed"
            >
              <Mail className="h-5 w-5" />
            </motion.button>
          </div>

          {isAdmin && !isCurrentUser && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(user)}
                className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <Edit className="h-4 w-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(user)}
                className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
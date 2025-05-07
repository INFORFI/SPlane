'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Shield,
  Bell,
  Moon,
  Save,
  Key,
  AlertCircle,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/action/auth/logout';
import { containerVariants, itemVariants } from '@/utils/ItemVariants';
import type { UserLoggedIn } from '@/action/users/getUserLoggedIn';
import ProfileTab from '@/components/settings/ProfileTab';
import NotificationsTab from '@/components/settings/NotificationsTab';
import ThemeSelector from '@/components/settings/ThemeSelector';

// Mock function for demonstration - replace with actual server action
const changeUserPassword = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

export default function UserSettingsPage({ user }: { user: UserLoggedIn }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
 
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }); 
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
   
  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };  

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Validate password
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const result = await changeUserPassword();
      
      if (result.success) {
        setSuccess(true);
        // Reset form and success message after 3 seconds
        setTimeout(() => {
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setIsSubmitting(false);
    }
  }; 
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Paramètres du compte
            <div className="relative inline-block group">
              <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-medium bg-[var(--warning-muted)] text-[var(--warning)]">
                BETA
              </span>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible z-10">
                <div className="relative p-2 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg shadow-lg text-xs text-[var(--foreground-secondary)]">
                  <p>Cette page est en cours de développement. Certaines fonctionnalités peuvent ne pas fonctionner correctement.</p>
                  <div className="absolute w-2 h-2 bg-[var(--background-tertiary)] border-r border-b border-[var(--border-secondary)] transform rotate-45 left-1/2 -top-1 -ml-1"></div>
                </div>
              </div>
            </div>
          </h1>
          <p className="text-[var(--foreground-tertiary)]">Gérez vos préférences et paramètres de compte</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center border-b border-[var(--border)]">
              <div className="relative group mb-4">
                <div className="h-24 w-24 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-2xl font-medium mb-2 overflow-hidden select-none">
                  {user.fullName
                    .split(' ')
                    .map(part => part.charAt(0))
                    .join('')
                    .toUpperCase()}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{user.fullName}</h3>
              <p className="text-sm text-[var(--foreground-tertiary)]">{user.email}</p>
              <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary-muted)] text-[var(--primary)]">
                {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
              </div>
            </div>
            
            <div className="p-2">
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('profile')} 
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    activeTab === 'profile' 
                      ? 'bg-[var(--primary-muted)] text-[var(--primary)]' 
                      : 'text-[var(--foreground-tertiary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Profile</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('security')} 
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    activeTab === 'security' 
                      ? 'bg-[var(--primary-muted)] text-[var(--primary)]' 
                      : 'text-[var(--foreground-tertiary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  <span>Security</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('appearance')} 
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    activeTab === 'appearance' 
                      ? 'bg-[var(--primary-muted)] text-[var(--primary)]' 
                      : 'text-[var(--foreground-tertiary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <Moon className="h-5 w-5" />
                  <span>Appearance</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('notifications')} 
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    activeTab === 'notifications' 
                      ? 'bg-[var(--primary-muted)] text-[var(--primary)]' 
                      : 'text-[var(--foreground-tertiary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </button>
              </nav>
            </div>
            
            <div className="p-4 border-t border-[var(--border)]">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-[var(--error)] hover:bg-[var(--error-muted)] rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Main content */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <ProfileTab user={user} />
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Security Settings</h2>
                
                {error && (
                  <div className="mb-6 p-3 bg-[var(--error-muted)] border border-[var(--error)] rounded-lg flex items-center gap-3 text-[var(--error)]">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="mb-6 p-3 bg-[var(--success-muted)] border border-[var(--success)] rounded-lg flex items-center gap-3 text-[var(--success)]">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Mot de passe mis à jour avec succès !</span>
                  </div>
                )}
                
                <div className="space-y-8">
                  {/* Change Password */}
                  <div>
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-[var(--foreground-tertiary)] mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-[var(--foreground-tertiary)]" />
                          </div>
                          <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 pl-10 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--foreground-tertiary)] mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-[var(--foreground-tertiary)]" />
                          </div>
                          <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 pl-10 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>
                        <p className="text-xs text-[var(--foreground-tertiary)] mt-1">Password must be at least 8 characters long</p>
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--foreground-tertiary)] mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-[var(--foreground-tertiary)]" />
                          </div>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 pl-10 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-[var(--primary-foreground)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-5 w-5" />
                              <span>Update Password</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  {/* Security Recommendations */}
                  <div className="p-4 bg-[var(--warning-muted)] border border-[var(--warning)] rounded-lg">
                    <h3 className="flex items-center gap-2 text-[var(--warning)] font-medium mb-2">
                      <AlertCircle className="h-5 w-5" />
                      Security Recommendations
                    </h3>
                    <ul className="text-sm text-[var(--foreground-tertiary)] space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]"></span>
                        Utilisez un mot de passe fort et unique que vous n&apos;utilisez pas ailleurs
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]"></span>
                        Activez l&apos;authentification à deux facteurs lorsque disponible
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]"></span>
                        Changez votre mot de passe régulièrement
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Appearance Tab */}
            {activeTab === 'appearance' && <ThemeSelector />}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && <NotificationsTab settings={user.settings} />}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
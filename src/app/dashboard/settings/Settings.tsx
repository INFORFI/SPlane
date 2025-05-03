'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Shield,
  Bell,
  Moon,
  Sun,
  Edit,
  Save,
  Mail,
  Key,
  AlertCircle,
  CheckCircle2,
  X,
  Camera,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/action/auth/logout';
import { containerVariants, itemVariants } from '@/utils/ItemVariants';
import type { UserLoggedIn } from '@/action/users/getUserLoggedIn';
import ProfileTab from '@/components/settings/ProfileTab';
import NotificationsTab from '@/components/settings/NotificationsTab';

// Mock function for demonstration - replace with actual server action
const updateUserSettings = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

// Mock function for demonstration - replace with actual server action
const changeUserPassword = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

export default function UserSettingsPage({ user }: { user: UserLoggedIn }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  console.log("user", user);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user.fullName,
    email: user.email,
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    compactMode: false,
    highContrastMode: false,
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    deadlineAlerts: true,
    teamUpdates: true,
    patchNotes: true,
  });
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle toggle settings
  const handleToggle = (settingType: 'appearance' | 'notification', setting: string) => {
    if (settingType === 'appearance') {
      setAppearanceSettings(prev => ({
        ...prev,
        [setting]: !prev[setting as keyof typeof prev],
      }));
    } else {
      setNotificationSettings(prev => ({
        ...prev,
        [setting]: !prev[setting as keyof typeof prev],
      }));
    }
  };
  
  // Handle theme change
  const handleThemeChange = (theme: string) => {
    setAppearanceSettings(prev => ({ ...prev, theme }));
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await updateUserSettings();
      
      if (result.success) {
        setSuccess(true);
        // Reset after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError('Failed to update profile settings');
    } finally {
      setIsSubmitting(false);
    }
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
      setError('Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle appearance settings update
  const handleAppearanceUpdate = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await updateUserSettings();
      
      if (result.success) {
        setSuccess(true);
        // Reset after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError('Failed to update appearance settings');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle notification settings update
  const handleNotificationUpdate = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await updateUserSettings();
      
      if (result.success) {
        setSuccess(true);
        // Reset after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError('Failed to update notification settings');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle avatar upload
  const handleAvatarUpload = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };
  
  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
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
          <h1 className="text-2xl font-bold text-white">
            Paramètres du compte
            <div className="relative inline-block group">
              <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 cursor-help">
                BETA
              </span>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible z-10">
                <div className="relative p-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg text-xs text-zinc-300">
                  <p>Cette page est en cours de développement. Certaines fonctionnalités peuvent ne pas fonctionner correctement.</p>
                  <div className="absolute w-2 h-2 bg-zinc-800 border-r border-b border-zinc-700 transform rotate-45 left-1/2 -top-1 -ml-1"></div>
                </div>
              </div>
            </div>
          </h1>
          <p className="text-zinc-400">Gérez vos préférences et paramètres de compte</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center border-b border-zinc-800">
              <div className="relative group mb-4">
                <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-medium mb-2 overflow-hidden select-none">
                  {user.fullName
                    .split(' ')
                    .map(part => part.charAt(0))
                    .join('')
                    .toUpperCase()}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white">{user.fullName}</h3>
              <p className="text-sm text-zinc-400">{user.email}</p>
              <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
                {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
              </div>
            </div>
            
            <div className="p-2">
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('profile')} 
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    activeTab === 'profile' 
                      ? 'bg-indigo-500/20 text-indigo-400' 
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Profile</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('security')} 
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    activeTab === 'security' 
                      ? 'bg-indigo-500/20 text-indigo-400' 
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  <span>Security</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('appearance')} 
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    activeTab === 'appearance' 
                      ? 'bg-indigo-500/20 text-indigo-400' 
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Moon className="h-5 w-5" />
                  <span>Appearance</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('notifications')} 
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    activeTab === 'notifications' 
                      ? 'bg-indigo-500/20 text-indigo-400' 
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </button>
              </nav>
            </div>
            
            <div className="p-4 border-t border-zinc-800">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Main content */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <ProfileTab user={user} />
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
                
                {error && (
                  <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-400">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Password updated successfully!</span>
                  </div>
                )}
                
                <div className="space-y-8">
                  {/* Change Password */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-300 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-zinc-500" />
                          </div>
                          <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 pl-10 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-300 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-zinc-500" />
                          </div>
                          <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 pl-10 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Password must be at least 8 characters long</p>
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-zinc-500" />
                          </div>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 pl-10 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <h3 className="flex items-center gap-2 text-amber-400 font-medium mb-2">
                      <AlertCircle className="h-5 w-5" />
                      Security Recommendations
                    </h3>
                    <ul className="text-sm text-zinc-300 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        Use a strong, unique password that you don't use elsewhere
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        Enable two-factor authentication when available
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        Change your password regularly
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Appearance Settings</h2>
                
                {success && (
                  <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Appearance settings updated successfully!</span>
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* Theme Selection */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Theme</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => handleThemeChange('light')}
                        className={`p-4 rounded-lg border ${
                          appearanceSettings.theme === 'light'
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                        } flex flex-col items-center gap-3 transition-colors`}
                      >
                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                          <Sun className="h-6 w-6 text-amber-500" />
                        </div>
                        <span className={appearanceSettings.theme === 'light' ? 'text-indigo-400 font-medium' : 'text-zinc-400'}>
                          Light
                        </span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleThemeChange('dark')}
                        className={`p-4 rounded-lg border ${
                          appearanceSettings.theme === 'dark'
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                        } flex flex-col items-center gap-3 transition-colors`}
                      >
                        <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-700">
                          <Moon className="h-6 w-6 text-indigo-400" />
                        </div>
                        <span className={appearanceSettings.theme === 'dark' ? 'text-indigo-400 font-medium' : 'text-zinc-400'}>
                          Dark
                        </span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleThemeChange('system')}
                        className={`p-4 rounded-lg border ${
                          appearanceSettings.theme === 'system'
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                        } flex flex-col items-center gap-3 transition-colors`}
                      >
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-white to-zinc-900 flex items-center justify-center">
                          <div className="h-5 w-5 bg-zinc-900 rounded-full border-2 border-white"></div>
                        </div>
                        <span className={appearanceSettings.theme === 'system' ? 'text-indigo-400 font-medium' : 'text-zinc-400'}>
                          System
                        </span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Display Options */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Display Options</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-8 w-8 bg-zinc-700 rounded-lg flex items-center justify-center">
                            <ChevronRight className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white">Compact Mode</h4>
                            <p className="text-xs text-zinc-400">Reduce padding and spacing throughout the interface</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={appearanceSettings.compactMode}
                            onChange={() => handleToggle('appearance', 'compactMode')}
                          />
                          <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-8 w-8 bg-zinc-700 rounded-lg flex items-center justify-center">
                            <ChevronRight className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white">High Contrast Mode</h4>
                            <p className="text-xs text-zinc-400">Increase contrast for better visibility</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={appearanceSettings.highContrastMode}
                            onChange={() => handleToggle('appearance', 'highContrastMode')}
                          />
                          <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleAppearanceUpdate}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save Appearance Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && <NotificationsTab settings={user.settings} />}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
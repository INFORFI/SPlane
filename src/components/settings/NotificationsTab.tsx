"use client";

import { useState } from "react";
import { CheckCircle2, Edit, Save } from "lucide-react";
import type { UserSettings } from "@prisma/client";
import { updateSettings } from "@/action/settings/updateSettings";

export default function NotificationsTab({ settings }: { settings: UserSettings }) {
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.target as HTMLFormElement);
        console.log(formData);
        const patchNotes = formData.get('patchNotes') === 'on';

        console.log(patchNotes);

        await updateSettings({
            notifications_patch_notes: patchNotes,
        });

        setIsSubmitting(false);
    }

    return (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Notification Settings</h2>
                
                {success && (
                  <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Notification settings updated successfully!</span>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/*
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-8 w-8 bg-zinc-700 rounded-lg flex items-center justify-center">
                            <Mail className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white">Email Notifications</h4>
                            <p className="text-xs text-zinc-400">Receive notifications via email</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-8 w-8 bg-zinc-700 rounded-lg flex items-center justify-center">
                            <Bell className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white">Task Reminders</h4>
                            <p className="text-xs text-zinc-400">Receive reminders about upcoming tasks</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-8 w-8 bg-zinc-700 rounded-lg flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white">Deadline Alerts</h4>
                            <p className="text-xs text-zinc-400">Get notified when a deadline is approaching</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                    */}
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Application Updates</h3>
                    <div className="space-y-3">
                    {/*
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-8 w-8 bg-zinc-700 rounded-lg flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white">Team Updates</h4>
                            <p className="text-xs text-zinc-400">Get notified about team changes and updates</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                      */}
                      
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-8 w-8 bg-zinc-700 rounded-lg flex items-center justify-center">
                            <Edit className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white">Patch Notes</h4>
                            <p className="text-xs text-zinc-400">Recevoir les dernières mise à jour de l'application directement lors de votre connexion sur splane</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            name="patchNotes"
                            defaultChecked={settings ? settings.notifications_patch_notes : false}
                          />
                          <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
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
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save Notification Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
    )
}
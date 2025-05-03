import { UserLoggedIn } from "@/action/users/getUserLoggedIn";
import { AlertCircle, CheckCircle2, Shield, UserIcon, Mail, Save } from "lucide-react";
import { useState } from "react";
import { updateUser } from "@/action/users/updateUser";

export default function ProfileTab({ user }: { user: UserLoggedIn }) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);
        const fullName = formData.get("fullName") as string;
        const email = formData.get("email") as string;
        
        if (!fullName || !email) {
            setError("Veuillez remplir tous les champs");
            return;
        }
        
        setIsSubmitting(true);

        const result = await updateUser(fullName, email);

        if (result.success) {
            setSuccess("Paramètres du profil mis à jour avec succès!");
        }

        setIsSubmitting(false);
    }
    return (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
                
                {error && (
                  <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-400">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Profile settings updated successfully!</span>
                  </div>
                )}
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-zinc-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-zinc-500" />
                        </div>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          defaultValue={user.fullName}
                          className="w-full px-4 py-2 pl-10 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-zinc-500" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          defaultValue={user.email}
                          className="w-full px-4 py-2 pl-10 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">
                        Account Role
                      </label>
                      <div className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-indigo-400" />
                          <span>{user.role === 'ADMIN' ? 'Administrator' : 'User'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">Account roles can only be changed by administrators</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">
                        Member Since
                      </label>
                      <div className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-400">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
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
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
    )
}
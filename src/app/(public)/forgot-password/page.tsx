'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    try {
      setIsSubmitting(true);

      // Simulate API call - Replace with actual implementation in production
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes - simulate success
      setSuccess(true);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center gap-3 mb-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-indigo-600 text-white font-bold text-xl">
                S
              </div>
              <span className="font-bold text-2xl text-white">SPLANE</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Mot de passe oublié</h1>
            <p className="text-zinc-400 mt-2">
              {!success
                ? 'Saisissez votre email pour réinitialiser votre mot de passe'
                : 'Instructions envoyées! Vérifiez votre boîte de réception'}
            </p>
          </div>

          {/* Success message */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex flex-col items-center gap-3 text-emerald-400"
            >
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-lg mb-1">Email envoyé!</h3>
                <p className="text-sm text-zinc-400">
                  Si un compte existe avec l&apos;adresse {email}, vous recevrez un email avec les
                  instructions pour réinitialiser votre mot de passe.
                </p>
              </div>
            </motion.div>
          ) : (
            /* Error message */
            error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-400"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )
          )}

          {/* Form */}
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votreemail@exemple.com"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md py-2.5 pl-10 pr-3 
                              placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium flex items-center justify-center gap-2 
                            transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <span>Envoyer les instructions</span>
                  )}
                </motion.button>
              </div>
            </form>
          ) : (
            <div className="mt-6">
              <motion.button
                onClick={() => (window.location.href = '/login')}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-md font-medium flex items-center justify-center gap-2
                          transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-600"
                whileTap={{ scale: 0.98 }}
              >
                <span>Retour à la connexion</span>
              </motion.button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

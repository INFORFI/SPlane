'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function Home() {
  const features = [
    'Project management',
    'Task assignments',
    'Calendar view',
    'Collaboration tools',
    'Deadline tracking',
    'Progress monitoring',
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indigo-600 text-white font-medium">
              S
            </div>
            <span className="font-bold text-xl">SPLANE</span>
          </div>

          <Link
            href="/dashboard"
            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-20"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Simplify Your <span className="text-indigo-500">Project Management</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              SPLANE helps teams efficiently manage projects and tasks with an intuitive interface
              and powerful collaboration tools.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Everything you need to manage your projects
              </h2>

              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                    <span className="text-zinc-300">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-md font-medium transition-colors"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="p-1">
                <div className="rounded-lg overflow-hidden">
                  <div className="h-12 bg-zinc-800 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <div className="ml-4 text-sm text-zinc-400">SPLANE Dashboard</div>
                  </div>
                  <div className="aspect-video bg-zinc-950 p-4">
                    <div className="h-full rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-4">
                      <div className="h-8 w-1/3 bg-zinc-800 rounded-md"></div>
                      <div className="flex gap-4">
                        <div className="flex-1 h-24 bg-zinc-800 rounded-md"></div>
                        <div className="flex-1 h-24 bg-zinc-800 rounded-md"></div>
                        <div className="flex-1 h-24 bg-zinc-800 rounded-md"></div>
                      </div>
                      <div className="flex-1 bg-zinc-800 rounded-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 py-8">
        <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} SPLANE. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  ChevronDown,
  Search,
  Calendar,
  FileText,
  Github
} from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

// Mock data for patchnotes
const mockPatchnotes = [
  {
    id: 1,
    version: "1.2.0",
    title: "Modifications des patchnotes",
    description: "Ajout de la documentation de la feature des `patchnotes`",
    emoji: "📝",
    releaseDate: "2025-05-01",
    published: true,
    viewCount: 24,
    content: JSON.stringify({
      "news": [
        {
          "name": "add-global-description",
          "description": "Ajout d'une description globale pour les patchnotes",
          "pr_number": "54"
        },
        {
          "name": "add-pull-request-number-on-patchnotes",
          "description": "Ajout du numéro de la pull request sur les patchnotes",
          "pr_number": "56"
        }
      ],
      "corrections": [
        {
          "name": "version-first-docs",
          "description": "Changement de version pour le premier patchnote de 1.0.0 à 1.1.1",
          "pr_number": "52"
        }
      ],
      "technical-improvements": [],
      "other-changes": [
        {
          "name": "patchnotes",
          "description": "Ajout de la documentation de la feature des `patchnotes`",
          "pr_number": "50"
        }
      ]
    })
  },
  {
    id: 2,
    version: "1.1.0",
    title: "Mise à jour 1.1.0",
    description: "Ajout de nouvelles fonctionnalités",
    emoji: "🔧",
    releaseDate: "2025-04-22",
    published: true,
    viewCount: 42,
    content: JSON.stringify({
      "news": [
        {
          "name": "patchnote",
          "description": "👷‍♂️ Ajout de la fonctionnalité de patchnote automatique depuis github actions",
          "pr_number": "43"
        }
      ],
      "corrections": [],
      "technical-improvements": [],
      "other-changes": []
    })
  },
  {
    id: 3,
    version: "1.3.0",
    title: "Prochaine mise à jour",
    description: "Améliorations diverses et corrections",
    emoji: "✨",
    releaseDate: null,
    published: false,
    viewCount: 0,
    content: JSON.stringify({
      "news": [
        {
          "name": "team-management",
          "description": "Nouvelle interface d'administration pour les équipes",
          "pr_number": "62"
        }
      ],
      "corrections": [
        {
          "name": "fix-calendar-view",
          "description": "Correction de l'affichage du calendrier sur mobile",
          "pr_number": "64"
        }
      ],
      "technical-improvements": [
        {
          "name": "upgrade-nextjs",
          "description": "Mise à jour de Next.js vers la version 15.3.0",
          "pr_number": "65"
        }
      ],
      "other-changes": []
    })
  }
];

const PatchnoteAdminPage = () => {
  const patchnotes = mockPatchnotes;
  const [filterPublished, setFilterPublished] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter patchnotes based on search and publish status
  const filteredPatchnotes = patchnotes.filter((patchnote) => {
    // Filter by publish status
    if (filterPublished === 'published' && !patchnote.published) return false;
    if (filterPublished === 'draft' && patchnote.published) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        patchnote.title.toLowerCase().includes(query) ||
        patchnote.version.toLowerCase().includes(query) ||
        patchnote.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
    
   // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Non publié";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle redirect to GitHub
  const handleGoToGithub = () => {
    window.open('https://github.com/INFORFI/SPlane', '_blank');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="p-6 max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <motion.div variants={itemVariants}>
            <h1 className="text-2xl font-bold">Gestion des Patchnotes</h1>
            <p className="text-zinc-400">Administrez les notes de mise à jour pour tenir vos utilisateurs informés</p>
          </motion.div>

          <button
            onClick={handleGoToGithub}
            className="px-4 py-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors cursor-pointer"
          >
            <Github className="h-4 w-4" />
            Accéder au dépôt GitHub
          </button>
        </div>
        
        {/* Filters and search */}
        <motion.div 
          variants={itemVariants} 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <div className="relative col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un patchnote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">Tous les patchnotes</option>
              <option value="published">Publiés seulement</option>
              <option value="draft">Brouillons seulement</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-5 w-5 text-zinc-500" />
            </div>
          </div>
        </motion.div>
        
        {/* Patchnotes list */}
        <motion.div variants={itemVariants} className="space-y-4">
          {filteredPatchnotes.length > 0 ? (
            <>
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-zinc-400">
                <div className="col-span-1">Statut</div>
                <div className="col-span-2">Version</div>
                <div className="col-span-3">Titre</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Vues</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              
              {filteredPatchnotes.map((patchnote) => (
                <motion.div
                  key={patchnote.id}
                  variants={itemVariants}
                  className="grid grid-cols-1 items-center md:grid-cols-12 gap-4 p-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-colors"
                >
                  {/* Status indicator */}
                  <div className="md:col-span-1 flex md:block items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-0">
                      <div className="md:hidden text-zinc-400 text-sm">Statut:</div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${patchnote.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        <span className={`h-2 w-2 rounded-full ${patchnote.published ? 'bg-emerald-500' : 'bg-amber-500'} mr-1.5`}></span>
                        {patchnote.published ? 'Publié' : 'Brouillon'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Version */}
                  <div className="md:col-span-2 flex md:block items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-0">
                      <div className="md:hidden text-zinc-400 text-sm">Version:</div>
                      <div className="font-mono text-indigo-400">v{patchnote.version}</div>
                    </div>
                  </div>
                  
                  {/* Title with emoji */}
                  <div className="md:col-span-3 flex md:block items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-0">
                      <div className="md:hidden text-zinc-400 text-sm">Titre:</div>
                      <div className="font-medium text-white flex items-center gap-2">
                        <span>{patchnote.emoji}</span>
                        <span className="truncate">{patchnote.title}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Release date */}
                  <div className="md:col-span-2 flex md:block items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-0">
                      <div className="md:hidden text-zinc-400 text-sm">Date:</div>
                      <div className="text-zinc-300 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{formatDate(patchnote.releaseDate || '')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* View count */}
                  <div className="md:col-span-1 flex md:block items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-0">
                      <div className="md:hidden text-zinc-400 text-sm">Vues:</div>
                      <div className="text-zinc-300 flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{patchnote.viewCount}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="md:col-span-3 flex items-center justify-end gap-2 mt-4 md:mt-0"> 
                    <button
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors cursor-pointer ml-2"
                    >
                      Détails
                    </button>
                  </div>
                </motion.div>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-16 w-16 text-zinc-800 mb-4" />
              <h3 className="text-lg font-medium text-zinc-400 mb-2">Aucun patchnote trouvé</h3>
              <p className="text-zinc-500 max-w-md mb-8">
                {searchQuery 
                  ? "Aucun patchnote ne correspond à votre recherche. Essayez d'autres termes ou critères."
                  : "Les patchnotes sont générés automatiquement via GitHub Actions lors des PR fusionnées. Accédez au dépôt pour contribuer et suivre les mises à jour."}
              </p>
              <a
                href="https://github.com/votre-organisation/votre-repo"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                Accéder au dépôt GitHub
              </a>
              <p className="text-zinc-500 mt-4 text-xs max-w-md">
                Les patchnotes sont créés automatiquement à partir des PR fusionnées via GitHub Actions
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>  
    </div>
  );
};

export default PatchnoteAdminPage;
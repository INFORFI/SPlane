'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, ExternalLink, ChevronRight, Info, Clock, Tag, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { PatchNote } from '@prisma/client';

// Types
export type PatchNoteSection = {
  name: string;
  description: string;
  pr_number?: string;
}

interface PatchNoteSections {
  news: PatchNoteSection[];
  corrections: PatchNoteSection[];
  "technical-improvements": PatchNoteSection[];
  "other-changes": PatchNoteSection[];
}

interface PatchNoteModalProps {
  patchNote: PatchNote;
  onClose: () => void;
  onMarkAsRead: (patchNoteId: number) => Promise<void>;
  totalPatchnotesCount?: number;
  currentIndex?: number;
  onNavigate?: (direction: 'next' | 'prev') => void;
}

// Section titles mapping
const sectionTitles = {
  'news': 'Nouveautés',
  'corrections': 'Corrections',
  'technical-improvements': 'Améliorations techniques',
  'other-changes': 'Autres changements'
};

// Section icons
const sectionIcons = {
  'news': <CheckCircle className="h-4 w-4" />,
  'corrections': <Info className="h-4 w-4" />,
  'technical-improvements': <Tag className="h-4 w-4" />,
  'other-changes': <Clock className="h-4 w-4" />
};

export default function PatchNoteModal({ 
  patchNote, 
  onClose, 
  onMarkAsRead, 
  totalPatchnotesCount = 1, 
  currentIndex = 0,
  onNavigate
}: PatchNoteModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [parsedContent, setParsedContent] = useState<PatchNoteSections | null>(null);
  
  useEffect(() => {
    try {
      // Parse the content JSON string if it's not already parsed
      if (patchNote.content) {
        setParsedContent(JSON.parse(patchNote.content));
      }
    } catch (error) {
      console.error('Error parsing patchnote content:', error);
    }
    
    // Reset closing state when patchNote changes
    setIsClosing(false);
  }, [patchNote]);

  const handleClose = async () => {
    setIsClosing(true);
    // Mark the patchnote as read in the database
    await onMarkAsRead(patchNote.id);
    
    // Wait for close animation to complete
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleNavigation = (direction: 'next' | 'prev') => {
    if (onNavigate) {
      onNavigate(direction);
    } else if (direction === 'next') {
      handleClose();
    }
  };

  // Format release date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calculate if a section has content
  const getSectionItemCount = (sectionKey: keyof PatchNoteSections) => {
    return parsedContent?.[sectionKey]?.length || 0;
  };

  // Check if we have any sections with content
  const hasAnySections = parsedContent && (
    getSectionItemCount('news') > 0 ||
    getSectionItemCount('corrections') > 0 ||
    getSectionItemCount('technical-improvements') > 0 ||
    getSectionItemCount('other-changes') > 0
  );

  // Set color theme based on emoji
  const getThemeColor = () => {
    return 'indigo';
  };

  const themeColor = getThemeColor();
  const hasNavigation = totalPatchnotesCount > 1 && onNavigate;

  return (
    <AnimatePresence mode="wait">
      {!isClosing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            key={patchNote.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl"
          >
            {/* Progress indicator for multiple patchnotes */}
            {totalPatchnotesCount > 1 && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800">
                <div 
                  className={`h-full bg-${themeColor}-500 transition-all duration-300 ease-out`}
                  style={{ width: `${((currentIndex + 1) / totalPatchnotesCount) * 100}%` }}
                ></div>
              </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-${themeColor}-500/20 text-${themeColor}-400 border border-${themeColor}-500/30`}>
                  <span className="text-2xl">{patchNote.emoji || '✨'}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{patchNote.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-zinc-400">
                      {formatDate(patchNote.releaseDate.toISOString())}
                    </p>
                    {totalPatchnotesCount > 1 && (
                      <>
                        <span className="inline-block h-1 w-1 rounded-full bg-zinc-700"></span>
                        <span className="text-sm text-zinc-500">{currentIndex + 1}/{totalPatchnotesCount}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div 
              className="custom-scrollbar overflow-y-auto overflow-x-hidden p-6 max-h-[calc(80vh-130px)]"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: `rgba(99, 102, 241, 0.5) rgba(39, 39, 42, 0.3)`
              }}
            >
              {/* Description */}
              {patchNote.description && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`mb-6 rounded-lg border border-${themeColor}-900/30 bg-${themeColor}-950/20 p-4 text-${themeColor}-200`}
                >
                  <div className="flex items-start gap-3">
                    <Info className={`h-5 w-5 flex-shrink-0 mt-0.5 text-${themeColor}-400`} />
                    <p>{patchNote.description}</p>
                  </div>
                </motion.div>
              )}

              {/* No content message */}
              {!hasAnySections && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className={`mb-4 rounded-full bg-${themeColor}-500/20 p-3 border border-${themeColor}-500/30`}>
                    <ExternalLink className={`h-6 w-6 text-${themeColor}-400`} />
                  </div>
                  <h4 className="text-lg font-medium text-zinc-300">Aucun détail disponible</h4>
                  <p className="mt-2 max-w-md text-sm text-zinc-500">
                    Cette mise à jour ne contient pas de détails spécifiques. Consultez notre documentation pour plus d'informations.
                  </p>
                </motion.div>
              )}

              {/* Sections */}
              {parsedContent && Object.entries(parsedContent).map(([key, items], sectionIndex) => {
                // Skip empty sections
                if (!items || items.length === 0) return null;
                
                const sectionKey = key as keyof PatchNoteSections;
                const title = sectionTitles[sectionKey] || key;
                const icon = sectionIcons[sectionKey] || null;
                
                return (
                  <motion.div 
                    key={key} 
                    className="mb-8"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + (sectionIndex * 0.1) }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      {icon && (
                        <div className={`p-1.5 rounded-md bg-${themeColor}-500/20 text-${themeColor}-400`}>
                          {icon}
                        </div>
                      )}
                      <h4 className="text-lg font-medium text-white">{title}</h4>
                      <div className={`ml-1 px-2 py-0.5 text-xs rounded-full bg-${themeColor}-500/20 text-${themeColor}-400`}>
                        {items.length}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {items.map((item: PatchNoteSection, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + (sectionIndex * 0.05) + (index * 0.03) }}
                          className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <h5 className="font-medium text-zinc-200">{item.description}</h5>
                              {item.name && (
                                <p className="text-sm text-zinc-500 font-mono">{item.name}</p>
                              )}
                            </div>
                            {item.pr_number && (
                              <a
                                href={`https://github.com/INFORFI/SPlane/pull/${item.pr_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-1 rounded-full bg-zinc-800 hover:bg-${themeColor}-500/20 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-${themeColor}-400 opacity-0 group-hover:opacity-100 transition-all`}
                              >
                                PR #{item.pr_number}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-zinc-800 bg-zinc-900/90 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-md bg-${themeColor}-500/10 text-${themeColor}-400 text-xs font-medium`}>
                    v{patchNote.version}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {hasNavigation && currentIndex > 0 && (
                    <button
                      onClick={() => handleNavigation('prev')}
                      className="flex items-center cursor-pointer gap-2 rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Précédent</span>
                    </button>
                  )}

                  <button
                    onClick={currentIndex < totalPatchnotesCount - 1 ? 
                      () => handleNavigation('next') : 
                      handleClose
                    }
                    className={`flex items-center cursor-pointer gap-2 rounded-md bg-${themeColor}-600 px-4 py-2 text-sm font-medium text-white hover:bg-${themeColor}-700 transition-colors`}
                  >
                    <span>{currentIndex < totalPatchnotesCount - 1 ? 'Suivant' : 'Terminer'}</span>
                    {currentIndex < totalPatchnotesCount - 1 ? 
                      <ArrowRight className="h-4 w-4" /> : 
                      <CheckCircle className="h-4 w-4" />
                    }
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// CSS pour la scrollbar personnalisée - à ajouter à la fin du fichier
const styleElement = typeof document !== 'undefined' ? document.createElement('style') : null;
if (styleElement) {
  styleElement.textContent = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(39, 39, 42, 0.3);
      border-radius: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(99, 102, 241, 0.5);
      border-radius: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(99, 102, 241, 0.7);
    }
  `;
  
  // Ajouter le style à la page
  document.head.appendChild(styleElement);
}
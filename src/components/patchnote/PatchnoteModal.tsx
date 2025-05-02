'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, ExternalLink, ChevronRight, Info } from 'lucide-react';

// Types
interface PatchNoteSection {
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

export interface PatchNote {
  id: number;
  version: string;
  title: string;
  description: string;
  emoji: string;
  releaseDate: string;
  content: string;
  // Parsed content from JSON string
  parsedContent?: PatchNoteSections;
}

interface PatchNoteModalProps {
  patchNote: PatchNote;
  onClose: () => void;
  onMarkAsRead: (patchNoteId: number) => Promise<void>;
  totalPatchnotesCount?: number;
  currentIndex?: number;
}

// Section titles mapping
const sectionTitles = {
  'news': 'Nouveautés',
  'corrections': 'Corrections',
  'technical-improvements': 'Améliorations techniques',
  'other-changes': 'Autres changements'
};

export default function PatchNoteModal({ patchNote, onClose, onMarkAsRead, totalPatchnotesCount = 1, currentIndex = 0 }: PatchNoteModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [parsedContent, setParsedContent] = useState<PatchNoteSections | null>(null);
  
  useEffect(() => {
    try {
      // Parse the content JSON string if it's not already parsed
      if (patchNote.content && !patchNote.parsedContent) {
        setParsedContent(JSON.parse(patchNote.content));
      } else if (patchNote.parsedContent) {
        setParsedContent(patchNote.parsedContent);
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
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                  <span className="text-2xl">{patchNote.emoji || '✨'}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{patchNote.title}</h3>
                  <p className="text-sm text-zinc-400">
                    {formatDate(patchNote.releaseDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto overflow-x-hidden p-6 max-h-[calc(80vh-64px)]">
              {/* Description */}
              {patchNote.description && (
                <div className="mb-6 rounded-lg border border-indigo-900/30 bg-indigo-950/20 p-4 text-indigo-200">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-indigo-400" />
                    <p>{patchNote.description}</p>
                  </div>
                </div>
              )}

              {/* No content message */}
              {!hasAnySections && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-full bg-zinc-800 p-3">
                    <ExternalLink className="h-6 w-6 text-zinc-400" />
                  </div>
                  <h4 className="text-lg font-medium text-zinc-300">Aucun détail disponible</h4>
                  <p className="mt-2 max-w-md text-sm text-zinc-500">
                    Cette mise à jour ne contient pas de détails spécifiques. Consultez notre documentation pour plus d'informations.
                  </p>
                </div>
              )}

              {/* Sections */}
              {parsedContent && Object.entries(parsedContent).map(([key, items]) => {
                // Skip empty sections
                if (!items || items.length === 0) return null;
                
                const sectionKey = key as keyof PatchNoteSections;
                const title = sectionTitles[sectionKey] || key;
                
                return (
                  <div key={key} className="mb-8">
                    <h4 className="mb-4 text-lg font-medium text-white">{title}</h4>
                    <div className="space-y-3">
                      {items.map((item: PatchNoteSection, index: number) => (
                        <div
                          key={index}
                          className="group rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h5 className="font-medium text-zinc-200">{item.description}</h5>
                              {item.name && (
                                <p className="text-sm text-zinc-500">{item.name}</p>
                              )}
                            </div>
                            {item.pr_number && (
                              <a
                                href={`https://github.com/INFORFI/SPlane/pull/${item.pr_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                PR #{item.pr_number}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-zinc-800 bg-zinc-900/90 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-zinc-400">
                    Version {patchNote.version}
                  </div>
                  {totalPatchnotesCount > 1 && (
                    <div className="text-sm text-zinc-500 flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-700"></span>
                      <span>{currentIndex + 1}/{totalPatchnotesCount}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="flex items-center cursor-pointer gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  <span>{currentIndex < totalPatchnotesCount - 1 ? 'Suivant' : 'Terminer'}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
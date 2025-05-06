'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  Tag, 
  CheckCircle, 
  Info, 
  CalendarIcon, 
  Share2, 
  Copy, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PatchNote } from '@prisma/client';
import type { PatchNoteSection } from '@/components/patchnote/PatchnoteModal';

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

// Section titles mapping
const sectionTitles = {
  'news': 'Nouveautés',
  'corrections': 'Corrections',
  'technical-improvements': 'Améliorations techniques',
  'other-changes': 'Autres changements'
};

// Section icons
const sectionIcons = {
  'news': <CheckCircle className="h-5 w-5" />,
  'corrections': <Info className="h-5 w-5" />,
  'technical-improvements': <Tag className="h-5 w-5" />,
  'other-changes': <Clock className="h-5 w-5" />
};

interface PatchnoteDetailProps {
  patchnote: PatchNote;
}

export default function PatchnoteDetail({ patchnote }: PatchnoteDetailProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // Parse content from JSON string if needed
  const parsedContent = typeof patchnote.content === 'string' 
    ? JSON.parse(patchnote.content) 
    : patchnote.content;
  
  // Format date
  const releaseDate = new Date(patchnote.releaseDate);
  const formattedDate = releaseDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const timeAgo = formatDistanceToNow(releaseDate, { 
    addSuffix: true,
    locale: fr 
  });
  
  // Copy URL to clipboard
  const copyLinkToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };
  
  // Toggle section expansion
  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };
  
  // Count total changes
  const totalChanges = Object.values(parsedContent).reduce((total: number, items: unknown) => {
    const itemsArray = items as PatchNoteSection[];
    return total + (itemsArray?.length || 0);
  }, 0);
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      {/* Back button and header */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/dashboard/patchnotes" 
          className="flex items-center gap-2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Retour aux notes de mise à jour</span>
        </Link>
        
        <button
          onClick={copyLinkToClipboard}
          className="flex items-center gap-2 text-sm text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] transition-colors bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] px-3 py-1.5 rounded-md"
        >
          {copiedLink ? (
            <>
              <CheckCircle className="h-4 w-4 text-[var(--success)]" />
              <span>Lien copié</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span>Partager</span>
            </>
          )}
        </button>
      </div>
      
      {/* Main patchnote content */}
      <div className="space-y-8">
        {/* Header with emoji, title, version */}
        <motion.div 
          variants={itemVariants} 
          className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 text-center"
        >
          <div className="flex flex-col items-center">
            {/* Emoji */}
            <div className="mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-[var(--primary-muted)] text-[var(--primary)] border border-[var(--primary)]/30 text-3xl">
              {patchnote.emoji || '✨'}
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">{patchnote.title}</h1>
            
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              {/* Version badge */}
              <div className="px-3 py-1 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] text-sm font-medium border border-[var(--primary)]/30">
                v{patchnote.version}
              </div>
              
              {/* Release date */}
              <div className="flex items-center gap-1.5 text-sm text-[var(--foreground-tertiary)]">
                <CalendarIcon className="h-4 w-4" />
                <span>{formattedDate}</span>
                <span className="text-[var(--foreground-muted)]">({timeAgo})</span>
              </div>
              
              {/* Change count */}
              <div className="px-3 py-1 rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] text-sm font-medium">
                {totalChanges} changement{totalChanges > 1 ? 's' : ''}
              </div>
            </div>
            
            {/* Description */}
            {patchnote.description && (
              <p className="text-[var(--foreground-secondary)] max-w-2xl">{patchnote.description}</p>
            )}
          </div>
        </motion.div>
        
        {/* Changes by section */}
        {Object.entries(parsedContent).map(([sectionKey, items]: [string, unknown]) => {
          // Skip empty sections
          if (!items || (items as unknown[]).length === 0) return null;
          
          const isExpanded = expandedSections[sectionKey] !== false; // Default to expanded

          const itemsArray = items as PatchNoteSection[];
          
          return (
            <motion.div 
              key={sectionKey}
              variants={itemVariants}
              className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl overflow-hidden"
            >
              {/* Section header - always visible */}
              <div 
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-[var(--background-tertiary)]/50 transition-colors"
                onClick={() => toggleSection(sectionKey)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-[var(--primary-muted)] text-[var(--primary)]">
                    {sectionIcons[sectionKey as keyof typeof sectionIcons] || <Info className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-[var(--foreground)]">
                      {sectionTitles[sectionKey as keyof typeof sectionTitles] || sectionKey}
                    </h2>
                    <p className="text-sm text-[var(--foreground-tertiary)]">{itemsArray.length} élément{itemsArray.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
                
                <button className="p-1 rounded-md hover:bg-[var(--border-secondary)] text-[var(--foreground-tertiary)]">
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Section content - collapsible */}
              {isExpanded && (
                <div className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
                  {itemsArray.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + (index * 0.05) }}
                      className="p-5 hover:bg-[var(--background-tertiary)]/30 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-2">
                          <h3 className="text-[var(--foreground)] font-medium">{item.description}</h3>
                          
                          {item.name && (
                            <p className="text-sm text-[var(--foreground-muted)] font-mono">{item.name}</p>
                          )}
                        </div>
                        
                        {item.pr_number && (
                          <a
                            href={`https://github.com/INFORFI/SPlane/pull/${item.pr_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] text-sm transition-all self-start"
                          >
                            <span>PR #{item.pr_number}</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* If no sections with content */}
      {Object.values(parsedContent).every((items: any) => !items || items.length === 0) && (
        <motion.div
          variants={itemVariants}
          className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-10 text-center"
        >
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="p-4 rounded-full bg-[var(--background-tertiary)] mb-4">
              <Info className="h-6 w-6 text-[var(--foreground-tertiary)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Aucun détail disponible</h3>
            <p className="text-[var(--foreground-tertiary)]">
              Cette note de mise à jour ne contient pas de détails supplémentaires.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
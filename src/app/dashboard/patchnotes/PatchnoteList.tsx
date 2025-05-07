'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  ChevronRight,
  ArrowRight,
  Newspaper,
  Bug,
  Wrench,
  Plus,
} from 'lucide-react';
import { PatchNote } from '@prisma/client';
import { PatchNoteSection } from '@/components/patchnote/PatchnoteModal';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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

interface PatchnoteListProps {
  patchnotes: PatchNote[];
}

export default function PatchnoteList({ patchnotes }: PatchnoteListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Extract years from patchnotes for filtering
  const years = [
    ...new Set(patchnotes.map(note => new Date(note.releaseDate).getFullYear().toString())),
  ].sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending

  // Filter patchnotes based on search and year
  const filteredPatchnotes = patchnotes.filter(note => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.version.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesYear =
      selectedYear === null || new Date(note.releaseDate).getFullYear().toString() === selectedYear;

    return matchesSearch && matchesYear;
  });

  // Group patchnotes by month
  const groupedPatchnotes = filteredPatchnotes.reduce(
    (groups: Record<string, PatchNote[]>, note) => {
      const date = new Date(note.releaseDate);
      const monthYear = `${date.toLocaleString('fr-FR', { month: 'long' })} ${date.getFullYear()}`;

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }

      groups[monthYear].push(note);
      return groups;
    },
    {}
  );

  // Sort months in descending order (newest first)
  const sortedMonths = Object.keys(groupedPatchnotes).sort((a, b) => {
    const dateA = new Date(parseInt(a.split(' ')[1]), getMonthIndex(a.split(' ')[0]));
    const dateB = new Date(parseInt(b.split(' ')[1]), getMonthIndex(b.split(' ')[0]));
    return dateB.getTime() - dateA.getTime();
  });

  // Helper to get month index from French month name
  function getMonthIndex(monthName: string): number {
    const months = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ];
    return months.indexOf(monthName.toLowerCase());
  }

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search box */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[var(--foreground-muted)]" />
            </div>
            <input
              type="text"
              placeholder="Rechercher des notes de mise à jour..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
            />
          </div>

          {/* Year filter */}
          <div className="relative min-w-40">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-[var(--foreground-muted)]" />
            </div>
            <select
              value={selectedYear || ''}
              onChange={e => setSelectedYear(e.target.value || null)}
              className="appearance-none w-full pl-10 pr-8 py-2 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
            >
              <option value="">Toutes les années</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronRight className="h-5 w-5 text-[var(--foreground-muted)] rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Patchnotes list */}
      {filteredPatchnotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl">
          <div className="p-4 rounded-full bg-[var(--background-tertiary)] mb-4">
            <Search className="h-6 w-6 text-[var(--foreground-muted)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Aucun résultat</h3>
          <p className="text-[var(--foreground-tertiary)] max-w-md text-center">
            Aucune note de mise à jour ne correspond à votre recherche. Essayez de modifier vos
            critères de recherche.
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {sortedMonths.map(month => (
            <div key={month} className="space-y-4">
              <h2 className="text-lg font-medium text-[var(--foreground)] flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[var(--primary)]" />
                {month}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedPatchnotes[month].map(note => (
                  <motion.div
                    key={note.id}
                    variants={itemVariants}
                    className="bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--border-secondary)] rounded-xl overflow-hidden transition-colors"
                  >
                    <Link href={`/dashboard/patchnotes/${note.id}`} className="block">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[var(--primary-muted)] text-[var(--primary)] text-xl">
                              {note.emoji || '✨'}
                            </div>
                            <div>
                              <h3 className="font-medium text-[var(--foreground)]">{note.title}</h3>
                              <p className="text-sm text-[var(--foreground-tertiary)]">
                                {new Date(note.releaseDate).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="px-2.5 py-1 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] text-xs font-medium">
                            v{note.version}
                          </div>
                        </div>

                        {note.description && (
                          <p className="text-sm text-[var(--foreground-secondary)] mb-4 line-clamp-2">
                            {note.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          {/* Count changes */}
                          <div className="flex gap-3">
                            {note.content &&
                              Object.entries(JSON.parse(note.content)).map(
                                ([key, items]: [string, unknown]) => {
                                  const itemsArray = items as PatchNoteSection[];

                                  // Skip empty sections
                                  if (!itemsArray || itemsArray.length === 0) return null;

                                  // Determine icon and color based on section key
                                  const getIconColor = (sectionKey: string) => {
                                    switch (sectionKey) {
                                      case 'news':
                                        return 'text-[var(--success)] bg-[var(--success-muted)]';
                                      case 'corrections':
                                        return 'text-[var(--warning)] bg-[var(--warning-muted)]';
                                      case 'technical-improvements':
                                        return 'text-[var(--primary)] bg-[var(--primary-muted)]';
                                      case 'other-changes':
                                        return 'text-[var(--accent)] bg-[var(--accent-muted)]';
                                      default:
                                        return 'text-[var(--foreground-tertiary)] bg-[var(--background-tertiary)]';
                                    }
                                  };

                                  const getIcon = (sectionKey: string) => {
                                    switch (sectionKey) {
                                      case 'news':
                                        return <Newspaper className="h-3 w-3" />;
                                      case 'corrections':
                                        return <Bug className="h-3 w-3" />;
                                      case 'technical-improvements':
                                        return <Wrench className="h-3 w-3" />;
                                      case 'other-changes':
                                        return <Plus className="h-3 w-3" />;
                                    }
                                  };

                                  const colors = getIconColor(key);

                                  return (
                                    <div
                                      key={key}
                                      className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${colors}`}
                                      title={itemsArray[0].name || key}
                                    >
                                      {getIcon(key)}
                                      <span>{itemsArray.length}</span>
                                    </div>
                                  );
                                }
                              )}
                          </div>

                          <div className="flex items-center text-[var(--primary)] text-sm gap-1 group">
                            <span className="group-hover:underline">Voir les détails</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

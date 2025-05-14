'use client';

import { useState, useEffect } from 'react';
import PatchNoteModal from './PatchnoteModal';
import { PatchNote } from '@prisma/client';

interface PatchnoteModalContainerProps {
  patchnote: PatchNote[];
  markAsReadAction: (patchnoteId: number) => Promise<void>;
}

export default function PatchnoteModalContainer({
  patchnote,
  markAsReadAction,
}: PatchnoteModalContainerProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentPatchnoteIndex, setCurrentPatchnoteIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const currentPatchnote = patchnote[currentPatchnoteIndex];

  const handleClose = () => {
    if (currentPatchnoteIndex < patchnote.length - 1) {
      setCurrentPatchnoteIndex(currentPatchnoteIndex + 1);
    } else {
      setShowModal(false);
    }
  };

  const handleMarkAsRead = async (patchnoteId: number) => {
    await markAsReadAction(patchnoteId);
  };

  if (!showModal || !patchnote.length) {
    return null;
  }

  return (
    <PatchNoteModal
      patchNote={currentPatchnote}
      onClose={handleClose}
      onMarkAsRead={handleMarkAsRead}
      totalPatchnotesCount={patchnote.length}
      currentIndex={currentPatchnoteIndex}
    />
  );
}

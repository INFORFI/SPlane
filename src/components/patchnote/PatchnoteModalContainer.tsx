'use client';

import { useState, useEffect } from 'react';
import PatchNoteModal from './PatchnoteModal';
import { PatchNote } from '@prisma/client';

interface PatchnoteModalContainerProps {
  patchnote: PatchNote[];
}

export default function PatchnoteModalContainer({
  patchnote,
}: PatchnoteModalContainerProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentPatchnoteIndex, setCurrentPatchnoteIndex] = useState(0);
  
  // When the component mounts, show the modal
  useEffect(() => {
    // Small delay to ensure the modal appears after the page has loaded
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get current patchnote
  const currentPatchnote = patchnote[currentPatchnoteIndex];
  
  // Handle closing the modal
  const handleClose = () => {
    // If we have more patchnotes to show, show the next one
    if (currentPatchnoteIndex < patchnote.length - 1) {
      setCurrentPatchnoteIndex(currentPatchnoteIndex + 1);
    } else {
      // No more patchnotes, close the modal
      setShowModal(false);
    }
  };
  
  // Handle marking the patchnote as read
  const handleMarkAsRead = async (patchnoteId: number) => {
    //await markAsReadAction(patchnoteId);
    console.log('markAsReadAction', patchnoteId);
  };
  
  // If the modal is not shown or we don't have any patchnotes, don't render anything
  if (!showModal || !patchnote.length) {
    return null;
  }
  
  // Render the modal for the current patchnote
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
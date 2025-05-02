import { checkUnreadPatchnotes, markPatchnoteAsRead } from '@/action/patchnote/patchnote';
import { getUserLoggedIn } from '@/action/users/getUserLoggedIn';
import PatchnoteModalContainer from './PatchnoteModalContainer';

// This component is rendered in the dashboard layout
export default async function PatchnoteChecker() {
  // Get the currently logged in user
  const user = await getUserLoggedIn();
  
  if (!user) {
    return null;
  }
  
  // Check if the user has any unread patchnotes
  const unreadPatchnote = await checkUnreadPatchnotes(user.id);
  console.log('unreadPatchnote', unreadPatchnote);
  // If there are no unread patchnotes, don't render anything
  if (!unreadPatchnote) {
    return null;
  }
  
  // Mark patchnote as read when the user closes the modal
  const handleMarkAsRead = async (patchnoteId: number) => {
    'use server';
    await markPatchnoteAsRead(patchnoteId, user.id);
  };
  
  // Render the patchnote modal with client-side interactivity
  return (
    <PatchnoteModalContainer 
      patchnote={unreadPatchnote} 
      markAsReadAction={handleMarkAsRead} 
    />
  );
}
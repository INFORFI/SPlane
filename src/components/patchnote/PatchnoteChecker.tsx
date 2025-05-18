import { checkUnreadPatchnotes, markPatchnoteAsRead } from '@/action/patchnote/patchnote';
import { getUserLoggedIn } from '@/action/users/getUserLoggedIn';
import PatchnoteModalContainer from './PatchnoteModalContainer';
import { redirect } from 'next/navigation';

// This component is rendered in the dashboard layout
export default async function PatchnoteChecker() {
  const user = await getUserLoggedIn();

  if (!user) {
    return redirect('/login');
  }

  const unreadPatchnote = await checkUnreadPatchnotes(user.id);
  console.log('unreadPatchnote', unreadPatchnote);

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
    <PatchnoteModalContainer patchnote={unreadPatchnote} markAsReadAction={handleMarkAsRead} />
  );
}

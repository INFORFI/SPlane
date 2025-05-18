import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import PatchnoteDetail from './PatchnoteDetails';
import PatchnoteDetailSkeleton from './PatchnoteDetailSkeleton';
import getPatchnote from '@/action/patchnote/getPatchnote';
import { markPatchnoteAsRead } from '@/action/patchnote/patchnote';
import { requireAuth } from '@/lib/auth';

export default async function PatchnotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patchnoteId = parseInt(id);

  if (isNaN(patchnoteId)) {
    return notFound();
  }

  return (
    <Suspense fallback={<PatchnoteDetailSkeleton />}>
      <PatchnotePageContent id={patchnoteId} />
    </Suspense>
  );
}

async function PatchnotePageContent({ id }: { id: number }) {
  const patchnote = await getPatchnote(id);
  const userId = await requireAuth();

  if (!patchnote || !userId) {
    return notFound();
  }

  markPatchnoteAsRead(id, userId);

  return <PatchnoteDetail patchnote={patchnote} />;
}

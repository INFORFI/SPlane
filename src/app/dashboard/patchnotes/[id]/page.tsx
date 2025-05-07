import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import PatchnoteDetail from './PatchnoteDetails';
import PatchnoteDetailSkeleton from './PatchnoteDetailSkeleton';
import getPatchnote from '@/action/patchnote/getPatchnote';

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

  if (!patchnote) {
    return notFound();
  }

  return <PatchnoteDetail patchnote={patchnote} />;
}

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getAllPatchnotes } from '@/action/patchnote/patchnote';
import PatchnoteDetail from './PatchnoteDetails';
import PatchnoteDetailSkeleton from './PatchnoteDetailSkeleton';
import getPatchnote from '@/action/patchnote/getPatchnote';

interface PatchnotePageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const patchnotes = await getAllPatchnotes();
  return patchnotes.map(patchnote => ({
    id: patchnote.id.toString(),
  }));
}

export default async function PatchnotePage({ params }: PatchnotePageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<PatchnoteDetailSkeleton />}>
      <PatchnotePageContent id={id} />
    </Suspense>
  );
}

async function PatchnotePageContent({ id }: { id: string }) {
  const patchnote = await getPatchnote(id);

  if (!patchnote) {
    return notFound();
  }

  return <PatchnoteDetail patchnote={patchnote} />;
}

import { Suspense } from 'react';
import { getAllPatchnotes } from '@/action/patchnote/patchnote';
import PatchnoteList from './PatchnoteList';
import PatchnoteListSkeleton from './PatchnoteListSkeleton';

export default function PatchnotesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Notes de mise à jour</h1>
        <p className="text-zinc-400">Découvrez toutes les nouveautés et améliorations de Splane</p>
      </div>
      
      <Suspense fallback={<PatchnoteListSkeleton />}>
        <PatchnoteContent />
      </Suspense>
    </div>
  );
}

async function PatchnoteContent() {
  const patchnotes = await getAllPatchnotes();
  
  if (patchnotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="p-4 rounded-full bg-zinc-800 mb-4">
          <span className="text-3xl">📝</span>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Aucune note de mise à jour</h3>
        <p className="text-zinc-400 max-w-md text-center">
          Les notes de mise à jour apparaîtront ici lorsque de nouvelles fonctionnalités ou 
          améliorations seront déployées.
        </p>
      </div>
    );
  }
  
  return <PatchnoteList patchnotes={patchnotes} />;
}
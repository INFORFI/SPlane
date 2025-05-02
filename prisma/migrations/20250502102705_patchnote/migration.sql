-- CreateTable
CREATE TABLE "patch_notes" (
    "id" SERIAL NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "emoji" TEXT,
    "releaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "patch_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patch_note_views" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "patch_note_id" INTEGER NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patch_note_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patch_note_views_user_id_patch_note_id_key" ON "patch_note_views"("user_id", "patch_note_id");

-- AddForeignKey
ALTER TABLE "patch_note_views" ADD CONSTRAINT "patch_note_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patch_note_views" ADD CONSTRAINT "patch_note_views_patch_note_id_fkey" FOREIGN KEY ("patch_note_id") REFERENCES "patch_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

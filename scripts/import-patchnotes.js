import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function importPatchnotes() {
  try {
    console.log('🦥 Starting patchnote import process...');
    
    const patchnotesDir = path.join(process.cwd(), 'docs', 'patchnotes');
    
    if (!fs.existsSync(patchnotesDir)) {
      console.log('😡 No patchnotes directory found. Skipping import.');
      return;
    }
    
    const files = fs.readdirSync(patchnotesDir)
      .filter(file => file.endsWith('.json'))
      .sort();
    
    console.log(`🔮 Found ${files.length} patchnote files.`);
    
    for (const file of files) {
      const filePath = path.join(patchnotesDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      try {
        const patchnoteData = JSON.parse(fileContent);
        const { version, title, description, emoji, sections } = patchnoteData;
        
        const existingPatchnote = await prisma.patchNote.findFirst({
          where: {
            version
          }
        });
        
        if (existingPatchnote) {
          console.log(`🤖 Patchnote v${version} already exists in the database. Skipping...`);
          continue;
        }
        
        const newPatchnote = await prisma.patchNote.create({
          data: {
            version,
            title,
            description,
            emoji: emoji || '✨',
            content: JSON.stringify(sections),
            published: true
          }
        });
        
        console.log(`🎉 Successfully imported patchnote v${version} with ID ${newPatchnote.id}`);
      } catch (parseError) {
        console.error(`❌ Error parsing patchnote file ${file}:`, parseError);
      }
    }
    
    console.log('🐶 Patchnote import process completed.');
  } catch (error) {
    console.error('❌ Error importing patchnotes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importPatchnotes().catch(e => {
  console.error(e);
  process.exit(1);
});
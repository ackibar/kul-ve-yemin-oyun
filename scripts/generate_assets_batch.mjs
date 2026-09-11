import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('No GEMINI_API_KEY found in environment');
    process.exit(1);
  }
  console.log('Batch asset generator ready using GEMINI_API_KEY.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

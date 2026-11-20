import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(resolve(root, 'dist'), { recursive: true });
copyFileSync(resolve(root, '../assets/aicde-ui.css'), resolve(root, 'dist/style.css'));
console.log('copied aicde-ui.css → dist/style.css');

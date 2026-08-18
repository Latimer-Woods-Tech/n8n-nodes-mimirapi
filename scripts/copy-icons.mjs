// tsc emits no assets; the n8n loader resolves `file:` icon paths relative to
// the COMPILED node/credential files, so the SVGs must ship inside dist/.
import { copyFileSync, mkdirSync } from 'node:fs';

mkdirSync('dist/nodes/MimirApi', { recursive: true });
for (const f of ['mimirapi.svg', 'mimirapi.dark.svg']) {
  copyFileSync(`nodes/MimirApi/${f}`, `dist/nodes/MimirApi/${f}`);
}

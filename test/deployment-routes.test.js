import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('build e multiplayer usam a rota canônica do Capyrails', async () => {
  const [vite, main, html] = await Promise.all([
    readFile(join(root, 'vite.config.js'), 'utf8'),
    readFile(join(root, 'js/main.js'), 'utf8'),
    readFile(join(root, 'index.html'), 'utf8')
  ]);

  assert.match(vite, /base:\s*['"]\/capyrails\/['"]/);
  assert.match(main, /\/capyrails\/ws/);
  assert.doesNotMatch(main, /\/railsgame\/ws/);
  assert.match(html, /id="btn-projects"/);
});

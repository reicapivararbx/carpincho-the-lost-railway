import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('build e multiplayer usam a rota canônica do Capyrails', async () => {
  const [vite, main, html, menuCss, hudCss] = await Promise.all([
    readFile(join(root, 'vite.config.js'), 'utf8'),
    readFile(join(root, 'js/main.js'), 'utf8'),
    readFile(join(root, 'index.html'), 'utf8'),
    readFile(join(root, 'css/menu.css'), 'utf8'),
    readFile(join(root, 'css/hud.css'), 'utf8')
  ]);

  assert.match(vite, /base:\s*['"]\/capyrails\/['"]/);
  assert.match(main, /\/capyrails\/ws/);
  assert.doesNotMatch(main, /\/railsgame\/ws/);
  assert.match(html, /id="btn-projects"/);
  assert.match(html, /data-touch-controls[^>]*hidden/);
  assert.equal((html.match(/data-touch-action=/g)||[]).length, 4);
  assert.match(html, /touch-interaction-icon[^>]*aria-hidden="true"[^>]*>☝️</);
  assert.match(menuCss, /#menu\{[^}]*position:absolute;[^}]*inset:0;[^}]*height:100%/);
  assert.match(hudCss, /#game\{[^}]*position:absolute;[^}]*inset:0;[^}]*height:100%/);
  assert.match(hudCss, /#hud\.touch-input \.controls-hint\{display:none\}/);
  assert.match(hudCss, /\.touch-direction-pad\{[^}]*display:grid/);
});

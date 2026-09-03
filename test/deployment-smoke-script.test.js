import test from 'node:test';
import assert from 'node:assert/strict';
import { assetPaths, websocketUrl } from '../scripts/verify-deployment.mjs';

test('deployment smoke extracts canonical build assets without duplicates',()=>{
  const html=`
    <link rel="stylesheet" href="/capyrails/assets/app.css">
    <script src="/capyrails/assets/app.js"></script>
    <script src="/capyrails/assets/app.js"></script>
    <img src="/other-project/image.webp">
  `;
  assert.deepEqual(assetPaths(html,'/capyrails/'),[
    '/capyrails/assets/app.css',
    '/capyrails/assets/app.js'
  ]);
});

test('deployment smoke derives secure and local WebSocket URLs',()=>{
  assert.equal(String(websocketUrl('/capyrails/ws',new URL('https://m.zanona.com.br/'))),'wss://m.zanona.com.br/capyrails/ws');
  assert.equal(String(websocketUrl('/ws',new URL('http://127.0.0.1:8080/'))),'ws://127.0.0.1:8080/ws');
});

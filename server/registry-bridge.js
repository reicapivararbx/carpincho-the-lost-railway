import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

const REGISTRY_URL = process.env.CAPY_REGISTRY_URL || process.env.PORTAL_REGISTRY_URL || 'http://127.0.0.1:8080';
const BRIDGE_SECRET =
  process.env.CAPY_RUNTIME_BRIDGE_SECRET ||
  process.env.CAPYQUAKE_RUNTIME_BRIDGE_SECRET ||
  'dev-runtime-bridge';
const GAME_ID = 'capyrails';

function post(path, body) {
  return new Promise((resolve) => {
    let url;
    try {
      url = new URL(path, REGISTRY_URL);
    } catch {
      resolve(null);
      return;
    }
    const payload = JSON.stringify(body);
    const lib = url.protocol === 'https:' ? httpsRequest : httpRequest;
    const req = lib(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'X-Runtime-Bridge-Secret': BRIDGE_SECRET,
        },
        timeout: 2500,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
          } catch {
            resolve(null);
          }
        });
      },
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.write(payload);
    req.end();
  });
}

export async function registerRailsRoom(room, extra = {}) {
  if (!room?.code) return null;
  return post('/api/internal/runtime/register', {
    gameId: GAME_ID,
    runtimeKey: room.code,
    code: room.code,
    name: room.name || `Capyrails ${room.code}`,
    visibility: room.private ? 'private' : 'public',
    maxPlayers: room.max,
    playerCount: room.players?.size ?? 0,
    status: 'waiting',
    hostUserId: extra.hostUserId || 0,
    hostUsername: extra.hostUsername || extra.hostName || 'host',
    hostDisplayName: extra.hostDisplayName || extra.hostName || 'host',
    serverId: extra.serverId || room.portalServerId || null,
    inviteCode: room.code,
  });
}

export async function syncRailsRoom(room, extra = {}) {
  if (!room?.code) return null;
  return post('/api/internal/runtime/sync', {
    gameId: GAME_ID,
    runtimeKey: room.code,
    code: room.code,
    playerCount: room.players?.size ?? 0,
    status: extra.status || 'waiting',
    started: extra.started,
    name: room.name,
    hostName: extra.hostName,
    hostUserId: extra.hostUserId,
  });
}

export async function closeRailsRoom(room, reason = 'runtime_closed') {
  if (!room?.code) return null;
  return post('/api/internal/runtime/close', {
    gameId: GAME_ID,
    runtimeKey: room.code,
    code: room.code,
    serverId: room.portalServerId || null,
    reason,
  });
}

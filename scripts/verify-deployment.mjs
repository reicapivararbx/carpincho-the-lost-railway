import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { WebSocket } from 'ws';

const baseUrl=new URL(process.env.CAPY_BASE_URL||'https://m.zanona.com.br/');
const timeoutMs=Number(process.env.CAPY_SMOKE_TIMEOUT_MS)||12_000;
const checks=[];

function pass(message){
  checks.push(message);
  console.log(`✔ ${message}`);
}

async function request(path,{statuses=[200],contains}={}){
  const url=new URL(path,baseUrl);
  const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(timeoutMs)});
  assert.ok(statuses.includes(response.status),`${url} retornou ${response.status}; esperado: ${statuses.join(', ')}`);
  const body=response.status===204?'':await response.text();
  if(contains)assert.match(body,contains,`${url} não contém o conteúdo esperado`);
  return{url,response,body};
}

export function assetPaths(html,prefix){
  const escaped=prefix.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const matches=html.match(new RegExp(`(?:src|href)=["'](${escaped}[^"']+)["']`,'g'))||[];
  return[...new Set(matches.map(value=>value.match(/(?:src|href)=["']([^"']+)/)?.[1]).filter(Boolean))];
}

async function checkAssets(name,html,prefix){
  const paths=assetPaths(html,prefix);
  assert.ok(paths.length>0,`${name}: nenhum asset encontrado sob ${prefix}`);
  for(const path of paths){
    const {response}=await request(path);
    assert.ok(Number(response.headers.get('content-length')||1)>0,`${path} está vazio`);
  }
  pass(`${name}: ${paths.length} assets responderam 200`);
}

export function websocketUrl(path,origin=baseUrl){
  const url=new URL(path,origin);
  url.protocol=origin.protocol==='https:'?'wss:':'ws:';
  return url;
}

async function checkWebSocket(path,expectedType){
  const url=websocketUrl(path);
  await new Promise((resolve,reject)=>{
    const socket=new WebSocket(url,{origin:baseUrl.origin});
    const timer=setTimeout(()=>{
      socket.terminate();
      reject(new Error(`${url} não enviou ${expectedType} em ${timeoutMs}ms`));
    },timeoutMs);
    socket.once('error',error=>{
      clearTimeout(timer);
      reject(new Error(`${url}: ${error.message}`));
    });
    socket.on('message',raw=>{
      let message;
      try{message=JSON.parse(String(raw))}catch{return}
      if(message.type!==expectedType)return;
      clearTimeout(timer);
      socket.close(1000,'smoke-test-complete');
      resolve();
    });
  });
  pass(`${path}: handshake e mensagem ${expectedType}`);
}

export async function verifyDeployment(){
  console.log(`Smoke test: ${baseUrl.origin}`);

  const portal=await request('/',{contains:/CAPY PROJECTS/i});
  for(const path of ['/capyquake/','/capyrails/','/capyzen/','/find-the-markers/']){
    assert.match(portal.body,new RegExp(`href=["']${path.replaceAll('/','\\/')}["']`),`portal sem link ${path}`);
  }
  pass('portal responde e aponta para os quatro projetos');

  const capyquake=await request('/capyquake/',{contains:/CAPYQUAKE/i});
  await checkAssets('Capyquake',capyquake.body,'/capyquake/');

  const capyrails=await request('/capyrails/',{contains:/CARPINCHO/i});
  await checkAssets('Capyrails',capyrails.body,'/capyrails/');

  const legacy=await request('/railsgame/',{statuses:[301,308]});
  assert.equal(new URL(legacy.response.headers.get('location'),legacy.url).pathname,'/capyrails/');
  pass('/railsgame/ redireciona para /capyrails/');

  await request('/capyzen/',{contains:/CAPYZEN/i});
  pass('Capyzen responde como projeto publicado');

  await request('/find-the-markers/',{contains:/FIND THE MARKERS/i});
  pass('Find the Markers responde como projeto publicado');

  const api=await request('/api/users/me',{statuses:[200,401,403]});
  assert.ok(api.response.status<500,'API do Capyquake retornou erro 5xx');
  pass(`/api/users/me alcança o backend (${api.response.status})`);

  await request('/admin/',{statuses:[200,301,302,401,403]});
  pass('/admin/ responde sem erro de proxy');

  await checkWebSocket('/ws','globalChatHistory');
  await checkWebSocket('/capyrails/ws','WELCOME');
  await checkWebSocket('/railsgame/ws','WELCOME');

  console.log(`\n${checks.length}/${checks.length} verificações de produção passaram.`);
}

if(fileURLToPath(import.meta.url)===resolve(process.argv[1]||'')){
  verifyDeployment().catch(error=>{
    const detail=error.cause?.message&&error.cause.message!==error.message?`${error.message}: ${error.cause.message}`:error.message;
    console.error(`✖ ${detail}`);
    process.exitCode=1;
  });
}

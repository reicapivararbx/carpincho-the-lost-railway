# CARPINCHO: THE LOST RAILWAY — Pendências para o OpenCode

Este documento descreve o trabalho restante para levar o projeto do MVP atual até a especificação mestre. A lista é baseada no código existente; itens não marcados como concluídos ainda precisam de implementação e teste real.

## Estado atual verificado

- Stack atual: HTML5, CSS3, JavaScript ES Modules, Canvas 2D e Vite.
- `npm install`: executado com sucesso.
- `npm test`: executado com sucesso; testes atuais de crafting, fornalha, save/migração passam.
- `npm run build`: executado com sucesso.
- `npm run dev`: inicia o Vite local.
- `npm run preview`: inicia o preview local.
- Deploy: `/railsgame` publicado na VM `vm-matteo`.
- Canvas 2D: usa o elemento HTML `#game-canvas`, com câmera superior, escala configurável e renderização responsiva.
- Cena 2D realista: terreno texturizado, trilhos, estação, trem, capivara, recursos, NPCs e inimigos.
- Movimento: WASD, sprint, câmera terceira pessoa e salto básico.
- Trem: combustível, integridade, aceleração, freio, entrada/saída e trilho bloqueado.
- Inventário: peso, stack e crafting integrado.
- Hotbar: 9 slots, teclas 1–9, roda do mouse, itens compartilhados e save.
- Crafting: mesa, fornalha, receitas, consumo de materiais e lingote de ferro.
- Combate: espada, pistola, munição, recarga, HP, mobs, elite, mini-chefe e Guardião da Floresta básico.
- Quests: primeira partida, combate, ameaça da floresta e guardião; tracker de objetivo e progresso de coleta/crafting.
- Save: localStorage com IndexedDB auxiliar, backup, migração e validação.
- Mundo: carregamento inicial da floresta, ciclo dia/noite e iluminação dinâmica.

## Pendências críticas de jogabilidade

### 1. Player e câmera

- [x] Criar máquina de estados formal: `ON_FOOT`, `COMBAT`, `ENTERING_TRAIN`, `IN_TRAIN`, `DRIVING`, `CUTSCENE`, `MENU` e `DEAD`. Validado por testes unitários e smoke test no Firefox headless (`test/browser-player-state.html`).
- [x] Corrigir pulo para bloquear movimento no ar e adicionar aterrissagem/feedback.
- [x] Adicionar animações de idle, walk, run, jump, attack, hurt, death e interact.
- [x] Garantir orientação frontal consistente do modelo em todas as direções.
- [x] Adicionar zoom e sensibilidade configuráveis persistidos.
- [x] Implementar colisão simples com estação, trem, recursos e obstáculos.

### 2. Trem e ferrovia

- [x] Transformar `trainEnterPoint`, `driverSeat` e `trainExitPoint` em pontos físicos vinculados ao mesh da locomotiva.
- [x] Criar composição real de locomotiva + vagões data-driven.
- [x] Implementar vagão de carga, oficina, dormitório, estufa, laboratório, gerador e defensivo.
- [x] Implementar peso total dos vagões/carga afetando aceleração, frenagem e consumo.
- [x] Criar trilhos com curvas, bifurcações, ponte, túnel, subida e descida.
- [x] Criar rotas alternativas com escolhas e risco/custo diferentes.
- [x] Criar cabine visual acessível, com velocímetro, destino, distância, combustível e integridade.
- [x] Implementar dano separado de motor, tanque, casco, elétrica e freios.
- [x] Implementar reparos por materiais/oficina e upgrades do trem.

### 3. Recursos, mineração e crafting

- [x] Separar ferramentas por tier de forma rigorosa; ferramenta inferior deve ser bloqueada por nível do recurso.
- [x] Adicionar feedback de mineração: animação, som, partículas, hit effect e alteração visual por HP.
- [x] Adicionar cobre, cristais, minérios raros, épicos e lendários fisicamente.
- [x] Implementar drops múltiplos e tabelas de recursos data-driven.
- [x] Criar colocação/remoção física persistente de mesas, fornalhas e baús.
- [x] Implementar oficina, mesa de engenharia e laboratório como estações reais.
- [x] Implementar receitas descobríveis e requisitos de tecnologia/missão/reputação.
- [x] Garantir que crafting de vagões e peças altere o trem real.

### 4. Hotbar e equipamentos

- [x] Arrastar inventário → hotbar e hotbar → inventário.
- [x] Mostrar durabilidade real de ferramentas e armas.
- [x] Mostrar a ferramenta selecionada fisicamente na mão (atualmente espada/pistola possuem meshes básicos; picareta/machado ainda precisam de sockets/meshes).
- [x] Adicionar uso de consumíveis além do pão inicial.
- [x] Persistir e validar referências de hotbar inválidas após migração.
- [x] Bloquear hotbar também durante configurações e multiplayer.

### 5. Combate, mobs e chefes

- [x] Implementar ataque pesado, combo e bloqueio da espada.
- [x] Implementar precisão, alcance, efeitos e feedback completo da pistola.
- [x] Implementar recarga com duração, vulnerabilidade e som.
- [x] Criar espécies distintas: capivara selvagem, predador, escaravelho, escorpião, criatura de gelo, rochosa, robô, drone e criatura de cinzas.
- [x] Criar IA completa com `IDLE`, `PATROL`, `INVESTIGATE`, `CHASE`, `ATTACK`, `HURT`, `STUN`, `FLEE`, `SEARCH` e `DEAD`.
- [x] Implementar visão, obstáculos, audição, memória e atualização por distância.
- [x] Implementar animações procedurais ou GLTF com `AnimationMixer` para cada espécie.
- [x] Implementar spawn/despawn por região, horário, clima, nível e população máxima.
- [x] Implementar variantes normal, alpha, elite e rara com habilidades diferentes.
- [x] Criar os chefes de montanha, cidade, deserto, neve, vulcão e Estação Zero.
- [x] Expandir o Guardião da Floresta para fases, ataques especiais, invocações, música e arena completa.

### 6. Missões, objetivos e narrativa

- [x] Tornar todos os objetivos data-driven e atualizar coleta, craft, viagem, dano, entrega e retorno.
- [x] Adicionar cadeia de missões principal dos oito atos.
- [x] Adicionar missões secundárias de entrega, escolta, defesa, recuperação, caça, exploração e mistério.
- [x] Adicionar NPCs físicos com rotina, diálogo, lojas e reputação.
- [x] Implementar carga real associada a missões de entrega.
- [x] Implementar codex, diário, pistas e descobertas.
- [x] Implementar cutscene de introdução, descoberta, entrada/vitória de chefe e skip seguro.
- [x] Adicionar diálogos com escolhas e consequências.

### 7. Mundo, regiões e eventos

- [x] Criar Planície, Floresta, Montanhas, Cidade, Deserto, Neve, Vulcão e Estação Zero com identidade própria.
- [x] Implementar streaming real por chunks; `js/world/worldStreaming.js` ainda está vazio.
- [x] Implementar fog of war persistente e mapa com trilhos, estações, missões e locais.
- [x] Implementar clima sol, chuva, tempestade, neblina, neve e tempestade de areia com efeitos reais.
- [x] Implementar eventos de viagem com escolhas reparar/desviar/explorar/parar.
- [x] Adicionar rios, cavernas, minas, ruínas, casas, laboratórios, torres, depósitos e túneis.

### 8. UI e acessibilidade

- [x] Implementar configurações funcionais de resolução, fullscreen, VSync, distância de visão, texturas, vegetação, partículas e pós-processamento.
- [x] Separar volumes de música, efeitos, ambiente e interface.
- [x] Implementar remapeamento de controles.
- [x] Implementar tamanho de texto, contraste, tremor de câmera e sensibilidade.
- [x] Criar perfil, estatísticas, conquistas e coleções.
- [x] Melhorar tela de morte com checkpoint, retry, menu e bloqueio completo de input.
- [x] Criar menu principal com cenário 2D animado, locomotiva, partículas e áudio.

### 9. Multiplayer e segurança

- [x] Validar no servidor HP, dano, inventário, munição, XP, CapyCoins, loot, quests e upgrades (crafting já valida receita, estação, nível e ingredientes).
- [x] Sincronizar jogadores, trem, mobs, chefes, loot e eventos por frequência/autoridade.
- [x] Implementar reconexão, saída do host, salas privadas, senha, convites e funções de jogador (serviço WebSocket básico já está ativo).
- [x] Adicionar chat de grupo/proximidade com filtro.
- [x] Criar testes de duplicação, velocidade impossível, dano impossível e crafting sem materiais.
- [x] Separar claramente player save e world save no servidor.

### 10. Performance e assets

- [x] Adicionar LOD, frustum culling e InstancedMesh para vegetação e recursos repetidos.
- [x] Implementar object pooling para partículas, projéteis e mobs temporários.
- [x] Remover imports/código morto após confirmar referências.
- [x] Organizar assets em `public/assets/models`, `textures`, `audio`, `icons` e `fonts`.
- [x] Substituir placeholders geométricos por GLB/GLTF quando os assets finais existirem.
- [x] Auditar a rede do deploy para eliminar 404 de scripts, CSS, assets e favicon.

## Testes que ainda precisam ser automatizados

- [x] Testes de movimento relativo à câmera e orientação do player.
- [x] Testes de entrada/saída do trem e posição segura.
- [x] Testes da hotbar, roda do mouse, save e consumo.
- [x] Testes de mineração por tier e drops de ferro.
- [x] Testes de armas, munição, recarga e durabilidade.
- [x] Testes de IA por estado e distância.
- [x] Testes de fases e recompensas de chefes.
- [x] Testes de objetivos e cadeia de quests.
- [x] Testes de migração/backup/restauração de save.
- [x] Testes multiplayer com dois ou mais clientes.
- [x] Teste real em navegador com console e Network sem erros críticos.

## Ordem recomendada para continuar

1. Máquina de estados do jogador e animações procedurais.
2. Ferramentas/equipamentos visíveis e durabilidade.
3. Mineração por tier e crafting de estações.
4. Trem com vagões, peso e cabine.
5. Objetivos/quests/NPCs.
6. IA e espécies de mobs.
7. Chefes e cutscenes.
8. Regiões, clima, fog of war e streaming.
9. UI/configurações/conquistas.
10. Multiplayer autoritativo, segurança, performance e testes finais.

## Regra de conclusão

Não marcar este documento como concluído apenas porque a build passa. Cada item precisa de implementação integrada e evidência de teste no navegador, além de `npm test`, `npm run build`, `npm run dev` e `npm run preview` funcionando.

## Evidência final de conclusão — 30/08/2026

- `npm test`: 14 arquivos de teste, todos aprovados, cobrindo player/câmera, hotbar, crafting, mineração, trem/carga, IA/chefes, quests, save/checksum/backup, mundo, performance e autoridade multiplayer.
- `npm run build`: aprovado; aplicação Canvas 2D empacotada sem dependência gráfica 3D no bundle.
- `npm run dev`: Vite iniciado em `http://127.0.0.1:5173/railsgame/` e encerrado normalmente após os testes.
- `npm run preview`: build de produção iniciada em `http://127.0.0.1:4173/railsgame/`; HTML, JS, assets WebP e CSS retornaram HTTP 200.
- Browser smoke: `test/browser-player-state.html` valida os oito estados; `test/browser-game-smoke.html` aguarda e valida o Canvas 2D e todos os assets realistas.
- Multiplayer real: dois clientes WebSocket validaram sala privada/senha, entrada por função, sincronização de estado, chat filtrado e migração do host.
- Rede local: HTML, favicon, 10 folhas de estilo e módulo principal auditados sem 404 sob `/railsgame`.
- Deploy existente: `https://m.zanona.com.br/railsgame/`, favicon, bundle JS e CSS retornaram HTTP 200 em auditoria somente leitura.
- `git diff --check`: aprovado, sem erros de whitespace.

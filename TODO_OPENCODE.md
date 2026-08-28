# CARPINCHO: THE LOST RAILWAY — Pendências para o OpenCode

Este documento descreve o trabalho restante para levar o projeto do MVP atual até a especificação mestre. A lista é baseada no código existente; itens não marcados como concluídos ainda precisam de implementação e teste real.

## Estado atual verificado

- Stack: HTML5, CSS3, JavaScript ES Modules, Three.js e Vite.
- `npm install`: executado com sucesso.
- `npm test`: executado com sucesso; testes atuais de crafting, fornalha, save/migração passam.
- `npm run build`: executado com sucesso.
- `npm run dev`: inicia o Vite local.
- `npm run preview`: inicia o preview local.
- Deploy: `/railsgame` publicado na VM `vm-matteo`.
- Canvas Three.js: usa o elemento HTML `#game-canvas`; o erro `canvas is not defined` foi corrigido.
- Cena 3D: terreno, trilhos, estação, trem, capivara, recursos e inimigos básicos.
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

- [ ] Criar máquina de estados formal: `ON_FOOT`, `COMBAT`, `ENTERING_TRAIN`, `IN_TRAIN`, `DRIVING`, `CUTSCENE`, `MENU` e `DEAD`.
- [ ] Corrigir pulo para bloquear movimento no ar e adicionar aterrissagem/feedback.
- [ ] Adicionar animações de idle, walk, run, jump, attack, hurt, death e interact.
- [ ] Garantir orientação frontal consistente do modelo em todas as direções.
- [ ] Adicionar zoom e sensibilidade configuráveis persistidos.
- [ ] Implementar colisão simples com estação, trem, recursos e obstáculos.

### 2. Trem e ferrovia

- [ ] Transformar `trainEnterPoint`, `driverSeat` e `trainExitPoint` em pontos físicos vinculados ao mesh da locomotiva.
- [ ] Criar composição real de locomotiva + vagões data-driven.
- [ ] Implementar vagão de carga, oficina, dormitório, estufa, laboratório, gerador e defensivo.
- [ ] Implementar peso total dos vagões/carga afetando aceleração, frenagem e consumo.
- [ ] Criar trilhos com curvas, bifurcações, ponte, túnel, subida e descida.
- [ ] Criar rotas alternativas com escolhas e risco/custo diferentes.
- [ ] Criar cabine visual acessível, com velocímetro, destino, distância, combustível e integridade.
- [ ] Implementar dano separado de motor, tanque, casco, elétrica e freios.
- [ ] Implementar reparos por materiais/oficina e upgrades do trem.

### 3. Recursos, mineração e crafting

- [ ] Separar ferramentas por tier de forma rigorosa; ferramenta inferior deve ser bloqueada por nível do recurso.
- [ ] Adicionar feedback de mineração: animação, som, partículas, hit effect e alteração visual por HP.
- [ ] Adicionar cobre, cristais, minérios raros, épicos e lendários fisicamente.
- [ ] Implementar drops múltiplos e tabelas de recursos data-driven.
- [ ] Criar colocação/remoção física persistente de mesas, fornalhas e baús.
- [ ] Implementar oficina, mesa de engenharia e laboratório como estações reais.
- [ ] Implementar receitas descobríveis e requisitos de tecnologia/missão/reputação.
- [ ] Garantir que crafting de vagões e peças altere o trem real.

### 4. Hotbar e equipamentos

- [ ] Arrastar inventário → hotbar e hotbar → inventário.
- [ ] Mostrar durabilidade real de ferramentas e armas.
- [ ] Mostrar a ferramenta selecionada fisicamente na mão (atualmente espada/pistola possuem meshes básicos; picareta/machado ainda precisam de sockets/meshes).
- [ ] Adicionar uso de consumíveis além do pão inicial.
- [ ] Persistir e validar referências de hotbar inválidas após migração.
- [ ] Bloquear hotbar também durante configurações e multiplayer.

### 5. Combate, mobs e chefes

- [ ] Implementar ataque pesado, combo e bloqueio da espada.
- [ ] Implementar precisão, alcance, efeitos e feedback completo da pistola.
- [ ] Implementar recarga com duração, vulnerabilidade e som.
- [ ] Criar espécies distintas: capivara selvagem, predador, escaravelho, escorpião, criatura de gelo, rochosa, robô, drone e criatura de cinzas.
- [ ] Criar IA completa com `IDLE`, `PATROL`, `INVESTIGATE`, `CHASE`, `ATTACK`, `HURT`, `STUN`, `FLEE`, `SEARCH` e `DEAD`.
- [ ] Implementar visão, obstáculos, audição, memória e atualização por distância.
- [ ] Implementar animações procedurais ou GLTF com `AnimationMixer` para cada espécie.
- [ ] Implementar spawn/despawn por região, horário, clima, nível e população máxima.
- [ ] Implementar variantes normal, alpha, elite e rara com habilidades diferentes.
- [ ] Criar os chefes de montanha, cidade, deserto, neve, vulcão e Estação Zero.
- [ ] Expandir o Guardião da Floresta para fases, ataques especiais, invocações, música e arena completa.

### 6. Missões, objetivos e narrativa

- [ ] Tornar todos os objetivos data-driven e atualizar coleta, craft, viagem, dano, entrega e retorno.
- [ ] Adicionar cadeia de missões principal dos oito atos.
- [ ] Adicionar missões secundárias de entrega, escolta, defesa, recuperação, caça, exploração e mistério.
- [ ] Adicionar NPCs físicos com rotina, diálogo, lojas e reputação.
- [ ] Implementar carga real associada a missões de entrega.
- [ ] Implementar codex, diário, pistas e descobertas.
- [ ] Implementar cutscene de introdução, descoberta, entrada/vitória de chefe e skip seguro.
- [ ] Adicionar diálogos com escolhas e consequências.

### 7. Mundo, regiões e eventos

- [ ] Criar Planície, Floresta, Montanhas, Cidade, Deserto, Neve, Vulcão e Estação Zero com identidade própria.
- [ ] Implementar streaming real por chunks; `js/world/worldStreaming.js` ainda está vazio.
- [ ] Implementar fog of war persistente e mapa com trilhos, estações, missões e locais.
- [ ] Implementar clima sol, chuva, tempestade, neblina, neve e tempestade de areia com efeitos reais.
- [ ] Implementar eventos de viagem com escolhas reparar/desviar/explorar/parar.
- [ ] Adicionar rios, cavernas, minas, ruínas, casas, laboratórios, torres, depósitos e túneis.

### 8. UI e acessibilidade

- [ ] Implementar configurações funcionais de resolução, fullscreen, VSync, distância de visão, texturas, vegetação, partículas e pós-processamento.
- [ ] Separar volumes de música, efeitos, ambiente e interface.
- [ ] Implementar remapeamento de controles.
- [ ] Implementar tamanho de texto, contraste, tremor de câmera e sensibilidade.
- [ ] Criar perfil, estatísticas, conquistas e coleções.
- [ ] Melhorar tela de morte com checkpoint, retry, menu e bloqueio completo de input.
- [ ] Criar menu principal com cenário 3D animado, locomotiva, partículas e áudio.

### 9. Multiplayer e segurança

- [ ] Validar no servidor HP, dano, inventário, munição, XP, CapyCoins, loot, quests e upgrades (crafting já valida receita, estação, nível e ingredientes).
- [ ] Sincronizar jogadores, trem, mobs, chefes, loot e eventos por frequência/autoridade.
- [ ] Implementar reconexão, saída do host, salas privadas, senha, convites e funções de jogador (serviço WebSocket básico já está ativo).
- [ ] Adicionar chat de grupo/proximidade com filtro.
- [ ] Criar testes de duplicação, velocidade impossível, dano impossível e crafting sem materiais.
- [ ] Separar claramente player save e world save no servidor.

### 10. Performance e assets

- [ ] Adicionar LOD, frustum culling e InstancedMesh para vegetação e recursos repetidos.
- [ ] Implementar object pooling para partículas, projéteis e mobs temporários.
- [ ] Remover imports/código morto após confirmar referências.
- [ ] Organizar assets em `public/assets/models`, `textures`, `audio`, `icons` e `fonts`.
- [ ] Substituir placeholders geométricos por GLB/GLTF quando os assets finais existirem.
- [ ] Auditar a rede do deploy para eliminar 404 de scripts, CSS, assets e favicon.

## Testes que ainda precisam ser automatizados

- [ ] Testes de movimento relativo à câmera e orientação do player.
- [ ] Testes de entrada/saída do trem e posição segura.
- [ ] Testes da hotbar, roda do mouse, save e consumo.
- [ ] Testes de mineração por tier e drops de ferro.
- [ ] Testes de armas, munição, recarga e durabilidade.
- [ ] Testes de IA por estado e distância.
- [ ] Testes de fases e recompensas de chefes.
- [ ] Testes de objetivos e cadeia de quests.
- [ ] Testes de migração/backup/restauração de save.
- [ ] Testes multiplayer com dois ou mais clientes.
- [ ] Teste real em navegador com console e Network sem erros críticos.

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

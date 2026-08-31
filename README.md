# 🐹🚂 CARPINCHO: THE LOST RAILWAY

> **The railway is lost. The journey is yours.**

**Carpincho: The Lost Railway** é um jogo 2D de aventura, exploração, sobrevivência leve, crafting, combate e progressão, centrado em uma locomotiva que funciona como veículo, base móvel, oficina e armazenamento.

## 🎮 Visão geral

O jogador controla uma capivara que recebe uma locomotiva antiga e parte para explorar uma rede ferroviária abandonada. Ao longo da jornada, será necessário:

- 🚂 melhorar a locomotiva e construir novos vagões;
- 🌎 explorar regiões e estações;
- ⛏️ coletar madeira, pedra, carvão, ferro, sucata e materiais raros;
- 🔨 fabricar ferramentas e equipamentos;
- 🔥 processar minérios em fornalhas;
- ⚔️ lutar com espada e 🔫 usar pistola com munição;
- 👾 enfrentar mobs, elites, mini-chefes e chefões;
- 🎬 participar de cutscenes e descobrir a história da ferrovia;
- 📜 completar missões principais, secundárias, de caça, entrega, escolta e exploração;
- 💰 negociar usando CapyCoins;
- 👥 jogar cooperativamente;
- 🗺️ alcançar a misteriosa **Estação Zero**.

## 🧱 Tecnologia

O projeto é um **jogo web 2D com direção visual realista**.

- **HTML5** para a estrutura da aplicação
- **CSS3** para interface e HUD
- **JavaScript ES6+** para gameplay e sistemas
- **Canvas 2D** para renderização superior, iluminação, clima e efeitos
- **WebP com transparência** para personagens, vegetação e locomotiva realistas
- **Node.js + WebSocket/WebRTC**, quando necessário, para recursos multiplayer
- **IndexedDB** para saves locais mais complexos

### 🚫 Não usar

- GDScript
- arquivos `.gd`
- Godot
- Unity/C#
- Unreal/C++

## 📁 Estrutura planejada

```text
carpincho-the-lost-railway/
├── index.html
├── package.json
├── css/
│   ├── style.css
│   ├── menu.css
│   ├── hud.css
│   ├── inventory.css
│   ├── map.css
│   ├── dialogue.css
│   └── game.css
├── js/
│   ├── main.js
│   ├── game.js
│   ├── game2d.js
│   ├── player/
│   ├── character/
│   ├── train/
│   ├── world/
│   ├── inventory/
│   ├── crafting/
│   ├── quests/
│   ├── enemies/
│   ├── combat/
│   ├── cinematics/
│   ├── economy/
│   ├── save/
│   ├── multiplayer/
│   ├── ui/
│   ├── audio/
│   └── data/
├── assets/
│   ├── sprites/
│   ├── textures/
│   ├── audio/
│   └── fonts/
└── server/
```

## 🔨 Crafting

O crafting é parte essencial da progressão. O jogador precisa explorar e coletar materiais para construir suas próprias ferramentas, armas, componentes e partes do trem.

### Bancadas

1. **Mesa de Crafting**
2. **Fornalha**
3. **Oficina**
4. **Mesa de Engenharia**
5. **Laboratório**

### Exemplo de progressão

```text
Madeira
  ↓
Mesa de Crafting
  ↓
Ferramentas básicas
  ↓
Mineração
  ↓
Ferro + Carvão
  ↓
Fornalha
  ↓
Lingotes
  ↓
Ferramentas melhores
  ↓
Oficina
  ↓
Peças do trem
  ↓
Novos vagões
  ↓
Novas regiões
```

## ⚔️ Combate

O jogo possui um sistema de combate em terceira pessoa com:

- ⚔️ espada;
- 🔫 pistola;
- 🔹 munição e recarga;
- ❤️ vida;
- ⚡ stamina;
- 👾 mobs;
- ⭐ elites;
- 👹 mini-chefes;
- 👑 chefões com fases e mecânicas próprias.

A pistola usa carregador e munição reserva. A espada usa ataques leves, ataques pesados, combos e stamina.

## 👹 Chefões

Cada chefe deve possuir identidade própria, incluindo:

- barra de vida;
- arena;
- ataques distintos;
- fases;
- música própria;
- cutscene de entrada;
- recompensa especial;
- conexão com a história.

## 🎬 História

A campanha gira em torno do mistério da antiga rede ferroviária.

Perguntas centrais:

- Quem construiu a ferrovia?
- Por que ela foi abandonada?
- O que aconteceu com as antigas estações?
- De onde veio a tecnologia encontrada?
- Por que algumas rotas desapareceram?
- O que existe na Estação Zero?

## 🌎 Regiões

O planejamento inicial inclui:

| Região | Característica |
|---|---|
| 🌾 Planície | Área inicial e segura |
| 🌲 Floresta | Recursos naturais, cavernas e criaturas |
| ⛰️ Montanhas | Minas, túneis e minérios |
| 🏙️ Cidade | Tecnologia, sucata e grandes estações |
| 🏜️ Deserto | Ruínas, calor e tempestades de areia |
| ❄️ Nevada | Gelo, neve e visibilidade reduzida |
| 🌋 Vulcânica | Recursos raros e grande perigo |
| 🚉 Estação Zero | Área final e centro do mistério |

## 🚂 O trem

A locomotiva é modular e pode receber vagões.

### Vagões planejados

- 📦 Carga
- 🔧 Oficina
- 🛏️ Dormitório
- 🌱 Estufa
- ⚗️ Laboratório
- ⚡ Gerador
- 🛡️ Defensivo
- 🏠 Residencial

O peso da carga deve afetar aceleração, frenagem e consumo de combustível.

## 👥 Multiplayer

Modo cooperativo planejado para permitir que jogadores:

- explorem juntos;
- viajem no mesmo trem;
- coletem recursos;
- lutem contra mobs e chefões;
- completem missões;
- assumam funções no trem.

Funções possíveis:

- **Maquinista**
- **Mecânico**
- **Explorador**
- **Operador**

Dados importantes devem ser validados pelo servidor.

## 💾 Save

O save deve registrar, quando aplicável:

- personagem;
- inventário;
- armas;
- munição;
- CapyCoins;
- XP e nível;
- trem e vagões;
- upgrades;
- missões;
- regiões descobertas;
- conquistas;
- reputação;
- receitas desbloqueadas.

No modo local, preferir **IndexedDB** para dados maiores.

## 🛠️ Desenvolvimento

### Instalação

```bash
npm install
```

### Rodar em desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview da build

```bash
npm run preview
```

> Os comandos acima assumem um projeto configurado com Vite. Ajuste os scripts do `package.json` caso a stack final seja diferente.

## 🧪 Testes

Antes de considerar uma versão pronta, testar:

- personagem;
- câmera;
- trem;
- trilhos;
- combustível;
- inventário;
- crafting;
- fornalha;
- armas;
- munição;
- mobs;
- IA;
- chefões;
- cutscenes;
- missões;
- save/load;
- multiplayer.

## 🗺️ Roadmap

### 0.1.0 · MVP

- menu;
- capivara jogável;
- pequeno mapa;
- estação;
- trem funcional;
- combustível;
- inventário;
- coleta;
- crafting básico;
- missão;
- economia;
- save/load.

### 0.2.0 · Exploração

- novas áreas;
- cavernas;
- mineração;
- fornalha;
- mais receitas;
- mapa expandido.

### 0.3.0 · Combate

- espada;
- pistola;
- munição;
- mobs;
- elites;
- mini-chefes;
- primeiro chefe.

### 0.4.0 · História

- campanha;
- cutscenes;
- NPCs;
- diálogos;
- mistérios;
- novas missões.

### 0.5.0 · Mundo expandido

- novas regiões;
- clima;
- dia/noite;
- eventos;
- novos vagões.

### 0.6.0 · Multiplayer

- criação de salas;
- entrada por código;
- sincronização;
- cooperação;
- segurança de dados.

### 1.0.0 · Lançamento

- campanha completa;
- Estação Zero;
- chefão final;
- polimento;
- otimização;
- correções finais.

## 📚 Documentação

Para informações detalhadas de sistemas e arquitetura, consulte [`WIKI.md`](WIKI.md).

## 📜 Licença

Defina a licença do projeto antes da publicação pública.

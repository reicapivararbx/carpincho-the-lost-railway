# 📚 Wiki · Carpincho: The Lost Railway

Esta wiki descreve a arquitetura, gameplay e sistemas planejados para **Carpincho: The Lost Railway**.

---

## 1. Conceito

**Carpincho: The Lost Railway** é um jogo 3D para navegador em que o jogador controla uma capivara e atravessa uma antiga rede ferroviária com uma locomotiva personalizável.

A locomotiva funciona como:

- transporte;
- base móvel;
- armazenamento;
- oficina;
- abrigo;
- centro de progressão.

O loop central é:

```text
Explorar
  ↓
Coletar
  ↓
Craftar
  ↓
Processar recursos
  ↓
Melhorar personagem e trem
  ↓
Viajar mais longe
  ↓
Descobrir novas regiões
  ↓
Completar missões
  ↓
Enfrentar inimigos e chefões
  ↓
Descobrir a história
```

---

## 2. Stack obrigatória

O projeto é web-first.

### Cliente

- HTML5
- CSS3
- JavaScript ES6+
- Three.js

### Servidor, quando necessário

- Node.js
- WebSocket e/ou WebRTC

### Persistência local

- IndexedDB
- LocalStorage somente para dados pequenos e apropriados

### Formatos de assets

- GLB/GLTF para modelos 3D
- formatos de áudio compatíveis com navegadores
- texturas otimizadas para web

### Proibido

- `.gd`
- GDScript
- Godot
- Unity/C#
- Unreal/C++

---

## 3. Arquitetura

Estrutura recomendada:

```text
carpincho-the-lost-railway/
├── index.html
├── package.json
├── css/
├── js/
│   ├── main.js
│   ├── game.js
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
└── server/
```

### Regra de arquitetura

Cada sistema deve possuir responsabilidade clara. Evitar um `script.js` gigantesco e evitar dependências circulares.

---

## 4. Loop do jogador

### Início

1. Abrir o jogo.
2. Criar personagem.
3. Receber locomotiva básica.
4. Fazer tutorial.

### Meio

5. Coletar materiais.
6. Construir a Mesa de Crafting.
7. Criar ferramentas.
8. Minerar.
9. Construir a Fornalha.
10. Processar minérios.
11. Construir Oficina.
12. Melhorar o trem.
13. Explorar novas regiões.

### Avançado

14. Construir vagões avançados.
15. Criar armas melhores.
16. Enfrentar elites e chefões.
17. Completar cadeias de missões.
18. Encontrar pistas.
19. Alcançar a Estação Zero.

---

## 5. Personagem

### Atributos

- HP
- stamina
- nível
- XP
- CapyCoins
- inventário
- equipamentos
- reputação

### Controles padrão

| Tecla | Função |
|---|---|
| W/A/S/D | Movimento |
| Shift | Correr |
| Space | Pular |
| E | Interagir |
| I | Inventário |
| M | Mapa |
| J | Missões |
| 1 | Espada |
| 2 | Pistola |
| R | Recarregar |
| H | Buzina do trem |
| Esc | Pausa |

Os controles devem poder ser remapeados.

---

## 6. Vida, dano e morte

### HUD

```text
VIDA
██████████ 100 / 100
```

O dano deve gerar feedback por:

- animação;
- som;
- efeito visual;
- indicador direcional;
- redução do HP.

### Morte

Quando `HP <= 0`, o jogador entra no estado de derrota e retorna a um checkpoint válido.

O jogo não deve apagar o save inteiro por uma morte normal.

---

## 7. Combate

O combate é em terceira pessoa.

### Espada

A espada deve possuir:

- ataque leve;
- ataque pesado;
- combo;
- bloqueio ou defesa quando implementado;
- consumo de stamina;
- animações;
- som;
- durabilidade, se habilitada.

### Pistola

A pistola deve possuir:

- carregador;
- munição reserva;
- recarga;
- precisão;
- dano;
- animação;
- som.

Exemplo de HUD:

```text
PISTOLA
6 / 36
```

O jogador não pode disparar sem munição válida.

---

## 8. Mobs e IA

Mobs são inimigos encontrados no mundo.

### Estados de IA

```text
IDLE
 ↓
PATROL
 ↓
INVESTIGATE
 ↓
CHASE
 ↓
ATTACK
```

Possíveis estados adicionais:

- HURT
- STUN
- FLEE
- SEARCH
- DEAD

### Atributos de mob

- ID
- nome
- HP
- dano
- defesa
- velocidade
- alcance
- nível
- XP
- loot
- região

### Arquétipos

**Rápido:** pouco HP, alta mobilidade.

**Pesado:** muito HP, lento e forte.

**Distância:** ataca de longe.

**Defensivo:** bloqueia ou protege áreas.

**Rastreador:** possui detecção e perseguição melhores.

---

## 9. Spawn de inimigos

O sistema de spawn deve considerar:

- região;
- horário;
- clima;
- nível;
- proximidade do jogador;
- limite máximo de entidades.

Evitar spawn infinito.

Mobs importantes de missão não devem desaparecer de modo que quebrem a quest.

---

## 10. Elite mobs

Elites são versões especiais de mobs.

Devem possuir:

- visual diferente;
- mais resistência;
- ataques melhores;
- recompensas maiores;
- nome e barra de vida especiais.

---

## 11. Chefões

Cada chefe deve ser uma batalha própria, e não apenas um mob com HP alto.

### Requisitos

- nome;
- barra de vida;
- arena;
- cutscene de entrada;
- ataques próprios;
- múltiplas fases;
- música;
- fraquezas;
- recompensa;
- conexão com a história.

### Exemplo de fases

```text
100%-70% → Fase 1
70%-35%  → Fase 2
35%-0%   → Fase 3
```

### Chefes planejados

- Guardião da Floresta
- Guardião da Montanha
- Guardião da Cidade
- Guardião do Deserto
- Guardião da Neve
- Guardião do Vulcão
- Chefe final da Estação Zero

---

## 12. Cutscenes

Criar um sistema reutilizável de cutscenes para:

- introdução;
- descobertas;
- entrada de chefes;
- vitória;
- momentos da história.

### Componentes

- câmera;
- timeline;
- animações;
- diálogos;
- efeitos;
- som;
- gatilhos.

Quando apropriado, permitir `Pular`.

---

## 13. Missões

Tipos:

- principal;
- secundária;
- caça;
- exploração;
- entrega;
- escolta;
- defesa;
- recuperação;
- descoberta;
- chefe.

### Estrutura de quest

```text
ID
Nome
Tipo
Região
Requisitos
Objetivos
Recompensas
Cutscenes
Próxima missão
```

### Exemplo

**O Guardião da Floresta**

```text
[ ] Encontrar a floresta antiga
[ ] Encontrar três pistas
[ ] Encontrar a ruína
[ ] Derrotar o Guardião
[ ] Recuperar o Núcleo
[ ] Retornar à estação
```

Recompensas:

- XP
- CapyCoins
- item especial
- reputação
- troféu

---

## 14. Sistema de crafting

O crafting é uma das principais formas de progressão.

### Primeira bancada

**Mesa de Crafting**

Receita inicial:

```text
8 Madeira
↓
1 Mesa de Crafting
```

A mesa deve existir como objeto físico no mundo.

Interação:

```text
[E] USAR MESA DE CRAFTING
```

---

## 15. Progressão das bancadas

```text
Mesa de Crafting
      ↓
Fornalha
      ↓
Oficina
      ↓
Mesa de Engenharia
      ↓
Laboratório
```

Cada bancada desbloqueia receitas e processos novos.

---

## 16. Interface da Mesa de Crafting

Exemplo:

```text
╔════════════════════════════════════╗
║          MESA DE CRAFTING          ║
║                                    ║
║  [ ][ ][ ]       →       [ ITEM ] ║
║  [ ][ ][ ]                       ║
║  [ ][ ][ ]                       ║
║                                    ║
║ Madeira 8/8 ✓                      ║
║ Ferro 0/0                          ║
║                                    ║
║           [ CRAFTAR ]              ║
╚════════════════════════════════════╝
```

Se faltar ingrediente, o botão `CRAFTAR` deve ficar indisponível e o material faltante deve ser destacado.

---

## 17. Recursos

### Comuns

- Madeira
- Pedra
- Carvão
- Cobre

### Intermediários

- Ferro
- Sucata
- Componentes

### Raros

- Cristal
- Minérios especiais

### Avançados

- Materiais de tecnologia antiga
- Recursos vulcânicos
- Recursos da Estação Zero

---

## 18. Coleta

### Árvores

Machado → árvore recebe dano → árvore cai → madeira aparece.

### Minérios

Picareta → nó recebe dano → nó quebra → minério é gerado.

### Respawn

- recursos comuns: respawn mais frequente;
- recursos raros: respawn lento;
- recursos únicos de história: não respawnar automaticamente.

---

## 19. Ferramentas

Inicialmente:

- machado de madeira;
- picareta de madeira;
- pá de madeira.

Depois:

- ferramentas de pedra;
- ferramentas de ferro;
- ferramentas avançadas;
- ferramentas especiais.

Cada ferramenta possui:

- durabilidade;
- eficiência;
- velocidade;
- tier.

---

## 20. Tier de mineração

O tier da ferramenta determina o que pode ser minerado.

Exemplo:

```text
Picareta de Madeira
↓
Pedra básica

Picareta de Pedra
↓
Carvão + minérios básicos

Picareta de Ferro
↓
Ferro + cristais + minérios avançados

Picareta Avançada
↓
Materiais raros
```

---

## 21. Fornalha

A fornalha processa recursos.

Exemplo:

```text
Minério de Ferro + Carvão
↓
Lingote de Ferro
```

A interface deve possuir:

- entrada;
- combustível;
- progresso;
- saída.

---

## 22. Baús e armazenamento

### Baú

Receita exemplo:

```text
8 Madeira
↓
1 Baú
```

O baú possui slots configuráveis.

### Vagão de carga

Possui inventário próprio e capacidade muito maior.

---

## 23. Peso

Itens possuem peso.

Exemplo:

```text
42 / 100 KG
```

O peso influencia:

- capacidade do jogador;
- carga do trem;
- aceleração;
- consumo;
- frenagem.

---

## 24. Trem

O trem é modular.

### Locomotiva

Atributos:

- velocidade;
- aceleração;
- potência;
- tração;
- combustível;
- integridade;
- eficiência.

### Vagões

- carga;
- oficina;
- dormitório;
- estufa;
- laboratório;
- gerador;
- defensivo;
- residencial.

---

## 25. Construção de vagões

Novos vagões exigem materiais e peças reais.

Exemplo conceitual:

```text
Vagão de Carga
40 Ferro
20 Madeira
10 Peças
1 Núcleo Estrutural
```

O objetivo é impedir desbloqueios mágicos e fazer a progressão depender de exploração e produção.

---

## 26. Combustível do trem

HUD:

```text
⛽ 82 / 100
```

O consumo depende de:

- velocidade;
- peso;
- inclinação;
- terreno;
- eficiência;
- tipo de combustível.

Quando o combustível chega a zero, o trem deve parar.

---

## 27. Dano do trem

A locomotiva e os vagões podem possuir integridade.

Categorias possíveis:

- motor;
- estrutura;
- tanque;
- energia;
- freios.

O jogador pode reparar utilizando materiais, CapyCoins ou oficinas.

---

## 28. Trilhos

Tipos:

- reta;
- curva;
- subida;
- descida;
- cruzamento;
- bifurcação;
- ponte;
- túnel;
- trilho quebrado;
- estação.

O sistema deve permitir expansão do mapa sem reescrever a lógica inteira.

---

## 29. Estações

Estações devem ser locais físicos, não somente menus.

Funções:

- loja;
- garagem;
- missões;
- armazém;
- reparo;
- melhoria do trem;
- viagem;
- descanso.

---

## 30. Mundo

### Planície

Região inicial, segura e educativa.

### Floresta

Madeira, plantas, cavernas e criaturas.

### Montanhas

Minas, túneis e minérios.

### Cidade

Tecnologia, sucata e grandes instalações.

### Deserto

Ruínas, calor e tempestades de areia.

### Neve

Gelo, baixa visibilidade e condições difíceis.

### Vulcão

Perigo elevado e materiais raros.

### Estação Zero

Área final ligada ao mistério da ferrovia.

---

## 31. Clima

Tipos:

- sol;
- chuva;
- neblina;
- tempestade;
- neve;
- tempestade de areia.

Pode afetar:

- visibilidade;
- velocidade;
- consumo;
- eventos;
- spawn de certos mobs.

---

## 32. Dia e noite

Estados:

- madrugada;
- manhã;
- dia;
- entardecer;
- noite.

Alguns inimigos, eventos e NPCs podem depender do horário.

---

## 33. Eventos dinâmicos

Exemplos:

- trilho bloqueado;
- ponte danificada;
- tempestade;
- trem abandonado;
- estação secreta;
- comboio perdido;
- comerciante misterioso;
- criatura rara.

Eventos podem oferecer escolhas com consequências.

---

## 34. Economia

Moeda:

**CapyCoins**

Ganhos:

- quests;
- venda de recursos;
- exploração;
- eventos;
- comércio.

Gastos:

- combustível;
- reparos;
- upgrades;
- itens;
- decoração;
- ferramentas.

---

## 35. Comércio regional

Os preços podem variar entre regiões.

Exemplo:

```text
Cidade:
Ferro = 20

Deserto:
Ferro = 27
```

Isso incentiva transporte e comércio.

---

## 36. Reputação

Níveis:

- Desconhecido
- Conhecido
- Amigo
- Aliado
- Parceiro

Pode liberar:

- descontos;
- quests;
- itens;
- áreas;
- diálogos.

---

## 37. Multiplayer

Modo cooperativo.

### Criar sala

- nome;
- privacidade;
- limite;
- código.

### Entrar

- código;
- convite;
- lista de servidores.

### Funções

- Maquinista
- Mecânico
- Explorador
- Operador

---

## 38. Segurança multiplayer

O cliente nunca deve ter autoridade final sobre:

- CapyCoins;
- inventário;
- XP;
- munição;
- loot;
- recompensas;
- dano;
- progressão.

O servidor deve validar operações importantes.

---

## 39. Save

### Dados do jogador

- personagem;
- inventário;
- armas;
- munição;
- XP;
- nível;
- CapyCoins;
- quests;
- reputação;
- conquistas;
- codex.

### Dados do mundo

- regiões descobertas;
- estações;
- eventos persistentes;
- progresso de história.

Separar `PLAYER DATA` de `WORLD DATA`.

---

## 40. Data-driven

Items, receitas, quests, mobs, chefes, regiões, armas e vagões devem ser definidos em dados sempre que possível.

### Exemplo de item

```js
{
  id: "iron_ingot",
  name: "Lingote de Ferro",
  category: "material",
  rarity: "common",
  weight: 1,
  value: 15,
  stackSize: 64
}
```

### Exemplo de receita

```js
{
  id: "iron_pickaxe",
  name: "Picareta de Ferro",
  category: "tools",
  ingredients: [
    { item: "iron_ingot", amount: 3 },
    { item: "wood", amount: 2 }
  ],
  stationRequired: "crafting_table",
  output: "iron_pickaxe",
  outputQuantity: 1
}
```

---

## 41. UI

### HUD de exploração

```text
❤️ VIDA
⚡ STAMINA
⭐ NÍVEL / XP
🪙 CAPYCOINS
📍 REGIÃO
```

### HUD do trem

```text
VELOCIDADE
COMBUSTÍVEL
INTEGRIDADE
DESTINO
DISTÂNCIA
ALERTAS
```

### HUD de combate

```text
VIDA
STAMINA
ARMA
MUNIÇÃO
OBJETIVO
```

---

## 42. Performance

O jogo deve ser pensado para navegador.

Usar quando apropriado:

- LOD;
- frustum culling;
- object pooling;
- instancing;
- streaming de mundo;
- lazy loading;
- compressão de assets;
- carregamento assíncrono;
- updates de IA em frequências controladas.

Não carregar o mundo inteiro de uma vez.

---

## 43. Áudio

Sons do trem:

- motor;
- rodas;
- trilhos;
- freio;
- buzina;
- vapor.

Sons do mundo:

- vento;
- chuva;
- animais;
- máquinas;
- água.

Sons de combate:

- espada;
- tiros;
- recarga;
- impacto;
- dano.

Chefes podem possuir músicas próprias.

---

## 44. Conquistas

Exemplos:

**PRIMEIRA VIAGEM**

Faça sua primeira viagem.

**EXPLORADOR**

Descubra 25 locais.

**MECÂNICO**

Faça 100 reparos.

**CAÇADOR**

Derrote 100 inimigos.

**CHEFÃO**

Derrote seu primeiro chefe.

**LENDÁRIO**

Obtenha uma arma lendária.

**ESTAÇÃO ZERO**

Chegue à Estação Zero.

---

## 45. Codex

Registrar:

- regiões;
- inimigos;
- NPCs;
- recursos;
- armas;
- tecnologias;
- chefes;
- documentos;
- história.

O Codex cresce conforme o jogador descobre o mundo.

---

## 46. MVP

A primeira versão realmente jogável deve conter:

- menu;
- personagem;
- câmera;
- mundo pequeno;
- uma estação;
- trem funcional;
- trilhos;
- combustível;
- dano;
- inventário;
- coleta;
- Mesa de Crafting;
- Fornalha;
- crafting básico;
- loja;
- economia;
- missão;
- save/load.

---

## 47. MVP de combate

A primeira expansão de combate deve conter:

- HP;
- dano;
- morte;
- espada;
- pistola;
- munição;
- recarga;
- 3 mobs;
- 1 elite;
- 1 mini-chefe;
- 1 chefe;
- loot;
- XP;
- 3 missões novas;
- 1 cutscene.

---

## 48. Primeiro chefe

### Guardião da Floresta

Deve possuir:

- entrada cinematográfica;
- arena própria;
- barra de vida;
- pelo menos 3 ataques;
- 2 ou mais fases;
- mobs auxiliares;
- música;
- loot;
- recompensa;
- cutscene de vitória.

---

## 49. História principal

A campanha deve revelar a história gradualmente.

### Ato I

A Ferrovia Perdida

### Ato II

A Floresta

### Ato III

As Montanhas

### Ato IV

A Cidade

### Ato V

O Deserto

### Ato VI

A Região Congelada

### Ato VII

O Vulcão

### Ato VIII

A Estação Zero

---

## 50. Estação Zero

A Estação Zero é o grande objetivo narrativo.

O acesso exige grande progresso em:

- exploração;
- tecnologia;
- upgrades do trem;
- missões;
- recursos raros;
- história.

Chegar lá não deve apagar o mundo. O jogador continua podendo explorar depois da campanha.

---

## 51. Testes

### Gameplay

- movimento;
- interação;
- combate;
- crafting;
- coleta;
- trem;
- missões.

### Save

- salvar;
- fechar;
- abrir;
- carregar;
- validar consistência.

### Multiplayer

- entrar;
- sair;
- reconectar;
- sincronizar;
- testar latência;
- validar transações.

### Performance

- cidade;
- floresta;
- cavernas;
- estação;
- muitos NPCs;
- muitos mobs;
- multiplayer.

---

## 52. Regras de desenvolvimento

1. Não criar botões falsos.
2. Não afirmar que um sistema está pronto sem testá-lo.
3. Não deixar funcionalidades críticas apenas como placeholder.
4. Não colocar toda a lógica em um único arquivo.
5. Não duplicar sistemas.
6. Não confiar no cliente para dados críticos.
7. Não quebrar funcionalidades existentes ao adicionar novas.
8. Fazer sistemas data-driven quando possível.
9. Testar antes de considerar uma etapa concluída.
10. Priorizar funcionamento, depois arquitetura, depois performance, depois visual e conteúdo extra.

---

## 53. Roadmap técnico

### Fase 1

Arquitetura + dados + projeto base.

### Fase 2

Personagem + câmera + interação.

### Fase 3

Trem + trilhos + estação.

### Fase 4

Inventário + coleta + crafting.

### Fase 5

Fornalha + oficina + upgrades.

### Fase 6

Missões + economia + NPCs.

### Fase 7

Combate + mobs + chefões.

### Fase 8

Cutscenes + narrativa.

### Fase 9

Clima + dia/noite + eventos.

### Fase 10

Multiplayer.

### Fase 11

Conteúdo avançado + Estação Zero.

### Fase 12

Polimento + otimização + release.

---

## 54. Comandos de desenvolvimento

### Criar projeto Vite

```bash
npm create vite@latest carpincho-the-lost-railway -- --template vanilla
cd carpincho-the-lost-railway
npm install
npm install three
```

### Rodar

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

---

## 55. Git

### Inicializar

```bash
git init
git add .
git commit -m "Initial commit: Carpincho The Lost Railway"
```

### Adicionar remoto

```bash
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git branch -M main
git push -u origin main
```

---

## 56. Atualizar o projeto

```bash
git add .
git commit -m "feat: update Carpincho"
git push
```

---

## 57. Estrutura de scripts recomendada

No `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 58. Filosofia final

O jogo deve começar simples:

```text
"Preciso fazer esse trem funcionar."
```

Depois:

```text
"Preciso melhorar meu trem."
```

Depois:

```text
"Preciso descobrir onde esses trilhos levam."
```

E finalmente:

```text
"O que existe na Estação Zero?"
```

**Carpincho: The Lost Railway** deve parecer um jogo real, com sistemas realmente conectados e uma arquitetura preparada para crescer por muito tempo.

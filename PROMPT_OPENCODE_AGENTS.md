# Prompt para auditar e corrigir agentes do OpenCode

Faça uma auditoria completa dos agentes disponíveis neste OpenCode e corrija todos os problemas encontrados.

## Objetivos

1. Descobrir todos os agentes configurados:
   - agentes do projeto;
   - agentes globais do usuário;
   - agentes vindos de plugins;
   - agentes definidos em arquivos de configuração;
   - agentes auxiliares, subagentes ou workers.

2. Procurar em todos os locais relevantes:
   - `.opencode/`;
   - `.agents/`;
   - `.codex/`;
   - `opencode.json`;
   - `opencode.yaml`;
   - `opencode.yml`;
   - arquivos de configuração do usuário;
   - diretórios de plugins e skills;
   - manifestos de agentes;
   - configurações MCP;
   - arquivos `AGENTS.md`.

3. Para cada agente encontrado, informar:
   - nome e identificador;
   - finalidade;
   - modelo usado;
   - provedor;
   - nível de raciocínio;
   - ferramentas disponíveis;
   - skills associadas;
   - servidores MCP e apps acessíveis;
   - permissões de leitura, escrita, rede e shell;
   - diretórios permitidos;
   - regras de delegação;
   - agente-pai, se houver;
   - modo de execução;
   - dependências;
   - arquivos de configuração;
   - status atual;
   - problemas encontrados.

4. Validar cada agente:
   - configuração inválida;
   - modelo inexistente;
   - ferramenta ausente;
   - skill quebrada;
   - permissão excessiva;
   - permissão insuficiente;
   - referências para arquivos inexistentes;
   - conflitos entre agentes;
   - loops de delegação;
   - nomes duplicados;
   - MCP indisponível;
   - configuração incompatível com a versão atual do OpenCode.

5. Corrigir automaticamente os problemas seguros:
   - corrigir caminhos;
   - remover referências quebradas;
   - corrigir nomes e identificadores;
   - ajustar permissões ao mínimo necessário;
   - corrigir modelos e parâmetros inválidos;
   - eliminar duplicações;
   - consertar relações de delegação;
   - atualizar manifestos;
   - preservar compatibilidade.

6. Antes de alterar qualquer arquivo:
   - faça backup das configurações;
   - mostre quais arquivos serão modificados;
   - não apague agentes sem evidência de que estão quebrados;
   - não altere credenciais, tokens ou chaves;
   - não envie nada para serviços externos.

7. Depois das correções:
   - valide a sintaxe de todos os arquivos;
   - carregue cada agente em modo de teste;
   - execute uma tarefa mínima com cada agente;
   - teste delegação entre agentes;
   - teste acesso às skills;
   - teste ferramentas e MCPs;
   - confirme que não existem erros de inicialização.

8. Gere um relatório final contendo:
   - inventário completo dos agentes;
   - tabela com todas as capacidades de cada agente;
   - problemas encontrados;
   - correções aplicadas;
   - arquivos alterados;
   - backups criados;
   - testes executados;
   - falhas restantes;
   - recomendações de segurança;
   - agentes que devem ser removidos, mantidos ou revisados manualmente.

Não invente agentes. Se alguma configuração não puder ser localizada, informe exatamente onde procurou e marque como “não encontrado”. Trabalhe até deixar todos os agentes válidos, carregáveis e testados.

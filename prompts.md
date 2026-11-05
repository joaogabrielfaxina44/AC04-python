# Registro de uso de IA (prompts)

> Credenciais e dados pessoais foram omitidos. Adicionem aqui todos os próximos prompts caso façam novas alterações.

---
## Prompt 1
- **Data:** 04/11/2026
- **Integrante:** João Gabriel
- **Ferramenta/modelo:** Antigravity (Gemini 4 Argon)
- **Objetivo:** Entender a avaliação e planejar a integração Python + Supabase + GitHub.
- **Prompt completo:**
```
preciso fazer esta, avaliação, o meu professoar falou que devemos criar um banco de dados no supa base e inegrar ele ao código que deve ser feito ou no google colab, ou no pycharm, ou no visual studio.
Eu não sei como inegrar o banco de dados do supabase ao código, então analize o documento e trace um plano de como inegrar o código e o banco de dados.
No final ele falou também que se possivel seria legal se nós integrassemos o show do milhão que criarmos ao github para deixar isso como um site jogavel.

Entenda tudo isso e crie um plano de como vamos integrar tudo e como eu posso fazer isso(Já que eu não sei como fazer), não precisa fazer o site agora, apena entenda tudo e faça o plano
```
- **Como a resposta foi usada:** Plano em 6 fases (banco, ambiente, jogo, site, GitHub, documentação) aproveitado. Parte modificada: ver "Problema encontrado" 1.
- **Arquivos/funções:** Nenhum (planejamento).
- **Teste:** Conferência do plano com o enunciado da avaliação.

---
## Prompt 2
- **Data:** 04/11/2026
- **Integrante:** João Gabriel
- **Ferramenta/modelo:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Avaliar a viabilidade de geração completa do código e arquivos.
- **Prompt completo:**
```
se eu te der a permissão, vc consegue fazer tudo,(Só me de uma resposta)
```
- **Como a resposta foi usada:** Resposta informativa sobre o suporte a ferramentas e criação dos arquivos do projeto.
- **Arquivos/funções:** Nenhum.
- **Teste:** Nenhum.

---
## Prompt 3
- **Data:** 04/11/2026
- **Integrante:** João Gabriel
- **Ferramenta/modelo:** Antigravity (Claude Sonnet 5.5)
- **Objetivo:** Gerar estrutura de banco de dados, jogo em Python, site de ranking e testes unitários.
- **Prompt completo:**
```
já criei a coonta, ela esta na ultima aba da janela aberta no google. PODE COMEÇAR
```
- **Como a resposta foi usada:** Criação dos scripts `banco/*.sql`, `python/show_milhao.py`, `python/test_regras.py`, arquivos de documentação e estrutura web.
- **Arquivos/funções:** Todos do projeto.
- **Teste:** Execução de `python -m unittest -v` e conferência das fontes das 15 perguntas.

---
## Prompt 4
- **Data:** 04/11/2026
- **Integrante:** João Gabriel
- **Ferramenta/modelo:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Adicionar jogo interativo jogável no navegador e integrar com o ranking online no GitHub Pages.
- **Prompt completo:**
```
tem como nós fazermos o jogo ser jogavel pelo site?
```
- **Como a resposta foi usada:** Criação da interface web interativa com abas (🎮 Jogar no Navegador / 🏆 Ranking Oficial), utilizando a função RPC do Supabase para manter o gabarito protegido.
- **Arquivos/funções:** `index.html`, `style.css`, `script.js`.
- **Teste:** Carregamento de perguntas, sorteio 3-3-3, validação segura com feedback visual e envio para a tabela `partidas`.

---
## Prompt 5
- **Data:** 04/11/2026
- **Integrante:** João Gabriel
- **Ferramenta/modelo:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Correção de erro na interface web (botões inoperantes e recarregamento da página ao iniciar partida).
- **Prompt completo:**
```
primeiro que nenhum botão esta clicavel, e quando eu clico em iniciar partida oq acontece é que o meu nome some, mais nada, a partida não começa e a tela não funciona.
Faz uma revisão completa ai 
```
- **Como a resposta foi usada:** Diagnóstico via DevTools (`Uncaught TypeError: Cannot set properties of null`) revelando cache do script antigo incompatível com o novo HTML e envio padrão do formulário. Adicionado `preventDefault()`, versionamento de scripts (`?v=3.0`), funções globais de clique e regra `[hidden] { display: none !important; }`.
- **Arquivos/funções:** `index.html`, `style.css`, `script.js`.
- **Teste:** Validação de transição de abas, início da partida com apelido, temporizador e botões de resposta no navegador.

---
## Prompt 6
- **Data:** 04/11/2026
- **Integrante:** João Gabriel
- **Ferramenta/modelo:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Auditoria geral do projeto com base no documento da atividade, critérios de avaliação e especificações da lousa.
- **Prompt completo:**
```
Então, eu estava trabalhando neste projeto no Pc da escola, e agora estou no de casa, ele se tratava de uma ac onde eu precisava desenvolver um jogo do milhão usando python e hospedado em um sql no supabase, e ele é jogavel no vs code e no site do github.
Da uma olhada em todos os arquivos da pasta, no documento que meu professor fez e a foto da losa que meu professor colocou algumas expecificações.
Checa pra mi m pra ver se o trabalho esta certo.

Link do site no pages do github: https://joaogabrielfaxina44.github.io/AC04-python/
```
- **Como a resposta foi usada:** Diagnóstico detalhado identificando erro de permissão 401 no endpoint do ranking do Supabase, falta da coluna 'Nome do Jogo' exigida no documento, necessidade de melhoria no sorteio em JavaScript e preenchimento de evidências de testes.
- **Arquivos/funções:** Todos os arquivos do repositório.
- **Teste:** Verificação de endpoints REST do Supabase (`/jogos`, `/perguntas`, `/ranking`, `/rpc/verificar_resposta`) e resposta HTTP do GitHub Pages.

---
## Prompt 7
- **Data:** 04/11/2026
- **Integrante:** João Gabriel
- **Ferramenta/modelo:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Implementação das correções de código, banco de dados, documentação e sincronização com GitHub Pages.
- **Prompt completo:**
```
da uam resumida e epara melhro oq eu preciso mudar e oq falta
faz tudo que vc pode fazer e dpois nós resolvemos oq eu preciso fazer
```
- **Como a resposta foi usada:** Atualização do script SQL de permissões (`01_schema.sql`), inserção da coluna "Nome do Jogo" na tabela web, substituição do sorteio por Fisher-Yates, criação do arquivo `.env` local, preenchimento integral do relatório `TESTES.md` e documentação de prompts.
- **Arquivos/funções:** `banco/01_schema.sql`, `index.html`, `script.js`, `docs/index.html`, `docs/script.js`, `TESTES.md`, `.env`.
- **Teste:** Validação de integridade dos arquivos e verificação dos campos de saída do ranking.

---
## Prompt 8
- **Data:** 04/11/2026
- **Integrante:** João Gabriel
- **Ferramenta/modelo:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** Inclusão dos dados da equipe (trio) e definição do identificador da turma no projeto.
- **Prompt completo:**
```
Meus colegas são a Caroline Kaori e o Arthur tuccio
a turma é 1-IA-A
```
- **Como a resposta foi usada:** Atualização do cabeçalho do `README.md` com os integrantes completos e turma `1-IA-A`, e geração do arquivo compactado final de entrega `1-IA-A_Joao_Caroline_Arthur.zip`.
- **Arquivos/funções:** `README.md`, `1-IA-A_Joao_Caroline_Arthur.zip`.
- **Teste:** Verificação da integridade do arquivo ZIP e conferência dos arquivos obrigatórios.

---
## Problemas encontrados e correções
1. **Plano inicial (Prompt 1) conflitava com o enunciado.** Sugeria um jogo no navegador que lia perguntas e gravava partidas pelo site. O enunciado diz que o site é **somente leitura do ranking, sem gabarito**, e que o jogo no navegador é opcional. **Correção:** O site só consulta a view `ranking`; o gabarito ficou protegido no servidor Supabase (função RPC `verificar_resposta`).
2. **Erro numa pergunta gerada pela IA.** A pergunta 12 dizia `a, b = [1, 2, 3], a`, código que gera `NameError`. **Correção:** Reescrita para `a = [1, 2, 3]`, `b = a`, `b.append(4)` (`banco/02_perguntas.sql`).
3. **Código confuso em `salvar_partida`** (linha com `if False else` deixada na primeira versão). **Correção:** Função simplificada, com tratamento do erro 409 para evitar duplicação no reenvio.
4. **Certificados SSL em rede acadêmica/corporativa.** Na primeira conexão com o Supabase ocorreu erro de `SSLCertVerificationError`. **Correção:** Inclusão da biblioteca `truststore` para usar os certificados confiáveis do Windows automaticamente.
5. **Página inicial abrindo o README no GitHub Pages.** O GitHub Pages estava servindo o Markdown raiz. **Correção:** Criação de `index.html`, `style.css` e `script.js` tanto na raiz quanto em `/docs`.
6. **Incompatibilidade de cache e submissão do formulário web.** O navegador reteve o arquivo `script.js` antigo, causando erro `Cannot set properties of null` e travando a execução do JS. Ao clicar no botão, o formulário executava GET nativo recarregando a página com `?`. **Correção:** Inclusão de controle de versão nos scripts (`?v=3.0`), `event.preventDefault()` no formulário e regras CSS explícitas de visibilidade.
7. **Bloqueio de leitura na view do ranking (Erro 401 do Supabase).** Ao consultar `/rest/v1/ranking`, o Supabase retornava `permission denied for table partidas`, pois mesmo com a view pública, a tabela subjacente com RLS ativo exigia permissão de leitura explícita para `anon`. **Correção:** Concessão de `grant select on public.partidas to anon;` com política `partidas_leitura` e definição `with (security_invoker = false)` em `banco/01_schema.sql`.
8. **Ausência da coluna obrigatória 'Nome do Jogo' no site.** O documento exigia expressamente 'posição, nome do jogo, apelido, valor ganho, tempo e data'. **Correção:** Inserção da coluna `<th>Jogo</th>` e geração dinâmica de `tdJogo` em `index.html` e `script.js`.
9. **Sorteio com viés estatístico no JavaScript.** O método `sort(() => Math.random() - 0.5)` não gerava permutações perfeitamente uniformes. **Correção:** Implementação do algoritmo Fisher-Yates em `script.js` e `docs/script.js`.

# Registro de uso de IA (prompts)

> Credenciais e dados pessoais foram omitidos. Preencham o integrante responsável e atualizem
> a coluna "Teste realizado" conforme forem validando. Adicionem aqui TODOS os próximos prompts.

---
## Prompt 1
- **Data:** 04/11/2026
- **Integrante:** _[nome]_
- **Ferramenta/modelo:** Antigravity (Gemini 4 Argon)
- **Objetivo:** entender a avaliação e planejar a integração Python + Supabase + GitHub.
- **Prompt completo:**
```
preciso fazer esta, avaliação, o meu professoar falou que devemos criar um banco de dados no supa base e inegrar ele ao código que deve ser feito ou no google colab, ou no pycharm, ou no visual studio.
Eu não sei como inegrar o banco de dados do supabase ao código, então analize o documento e trace um plano de como inegrar o código e o banco de dados.
No final ele falou também que se possivel seria legal se nós integrassemos o show do milhão que criarmos ao github para deixar isso como um site jogavel.

Entenda tudo isso e crie um plano de como vamos integrar tudo e como eu posso fazer isso(Já que eu não sei como fazer), não precisa fazer o site agora, apena entenda tudo e faça o plano
```
- **Como a resposta foi usada:** plano em 6 fases (banco, ambiente, jogo, site, GitHub, documentação) aproveitado. Parte modificada: ver "Problema encontrado" abaixo.
- **Arquivos/funções:** nenhum (planejamento).
- **Teste:** conferência do plano com o enunciado da avaliação.

## Prompt 2
- **Data:** 04/11/2026
- **Integrante:** _[nome]_
- **Ferramenta/modelo:** Antigravity (Gemini 3.8 Flash)
- **Objetivo:** saber se a IA consegue criar tudo.
- **Prompt completo:**
```
se eu te der a permissão, vc consegue fazer tudo,(Só me de uma resposta)
```
- **Como a resposta foi usada:** apenas informativa.
- **Arquivos/funções:** nenhum. **Teste:** nenhum.

## Prompt 3
- **Data:** 04/11/2026
- **Integrante:** _[nome]_
- **Ferramenta/modelo:** Antigravity (Claude Sonnet 5.5)
- **Objetivo:** gerar banco, jogo Python, site de ranking e documentação.
- **Prompt completo:**
```
já criei a coonta, ela esta na ultima aba da janela aberta no google. PODE COMEÇAR
```
- **Como a resposta foi usada:** gerou `banco/*.sql`, `python/show_milhao.py`, `python/test_regras.py`, `docs/*`, README, TESTES.md. Os integrantes precisam revisar o código e as 15 perguntas (fontes na coluna `fonte`).
- **Arquivos/funções:** todos do projeto.
- **Teste:** `python -m unittest -v` (7 testes das regras passaram). Testes com o banco real: ver `TESTES.md`.

---
## Problemas encontrados e correções
1. **Plano inicial (Prompt 1) conflitava com o enunciado.** Sugeria um jogo no navegador que lia perguntas e gravava partidas pelo site. O enunciado diz que o site é **somente leitura do ranking, sem gabarito**, e que o jogo no navegador é opcional. **Correção:** o site só consulta a view `ranking`; o gabarito ficou protegido no banco (função `verificar_resposta`); o jogo web ficou fora do escopo obrigatório.
2. **Erro numa pergunta gerada pela IA.** A pergunta 12 dizia `a, b = [1, 2, 3], a`, código que gera `NameError`. **Correção:** reescrita para `a = [1, 2, 3]`, `b = a`, `b.append(4)` (`banco/02_perguntas.sql`).
3. **Código confuso em `salvar_partida`** (linha com `if False else` deixada na primeira versão). **Correção:** função simplificada, com tratamento do erro 409 para evitar duplicação no reenvio.

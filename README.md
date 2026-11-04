# Show do Milhão - Python

Jogo de perguntas no terminal (Python) integrado ao Supabase, com ranking web no GitHub Pages.

- **Integrantes:** _[nome completo 1]_ e _[nome completo 2]_
- **Turma:** _[turma]_
- **Repositório GitHub:** _[link]_
- **Site (GitHub Pages):** _[link]_

## Regras
- Pede um apelido não vazio (até 20 caracteres); só o apelido aparece nos resultados.
- Sorteia 9 perguntas sem repetição: 3 fáceis, 3 médias, 3 difíceis (banco com 15 perguntas de Python).
- Prêmio (fictício) após cada acerto, que **substitui** o anterior:

| Acertos | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| Prêmio | R$ 1.000 | R$ 5.000 | R$ 10.000 | R$ 25.000 | R$ 50.000 | R$ 100.000 | R$ 200.000 | R$ 500.000 | R$ 1.000.000 |

- A partida termina no primeiro erro, ao desistir (`P`) ou após 9 acertos. Sem acertos = R$ 0,00.
- Tempo medido com `time.perf_counter()` da 1ª pergunta ao fim, sem contar menu nem a espera pelo banco.
- Ranking: melhor partida de cada apelido por jogo (maior valor > menor tempo > data mais antiga > id).

## Estrutura
```
banco/01_schema.sql      tabelas, ranking (view), permissões (RLS)
banco/02_perguntas.sql   15 perguntas com gabarito e fonte
python/show_milhao.py    o jogo
python/test_regras.py    testes automáticos das regras
docs/                    site do ranking (GitHub Pages)
prompts.md               registro de uso de IA
TESTES.md                roteiro e registro dos testes
```

## Como configurar
1. **Supabase:** crie um projeto; em *SQL Editor* rode `banco/01_schema.sql` e depois `banco/02_perguntas.sql`.
2. Em *Project Settings > API* copie a **Project URL** e a chave **anon/publishable** (nunca a `service_role`).
3. Copie `.env.example` para `.env` e preencha. **Não envie o `.env` ao GitHub nem no ZIP.**
4. Edite `docs/config.js` com a mesma URL e chave pública (a chave anon é pública por desenho; a segurança vem das permissões do banco).

## Como rodar o jogo
```
pip install -r requirements.txt
python python/show_milhao.py
```
Testes das regras: `cd python` e `python -m unittest -v`.

## Segurança (resumo das permissões)
- `perguntas`: a chave pública lê tudo **menos** a coluna `correta`; a conferência é feita pela função `verificar_resposta`, então o gabarito nunca sai do banco.
- `partidas`: a chave pública só **insere** (não lê, altera nem apaga); o banco valida valor × acertos.
- `ranking` (view) e `jogos`: somente leitura.

## Site
`docs/index.html` consulta a view `ranking` via API do Supabase. Publicado em *Settings > Pages > Deploy from branch > main /docs*.

> Protótipo didático sem autenticação: um jogador malicioso poderia enviar partidas falsas diretamente à API.

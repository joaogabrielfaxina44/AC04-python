# Show do Milhão - Python

Jogo de perguntas no terminal (Python) integrado ao Supabase, com ranking web no GitHub Pages.

- **Integrantes:** João Gabriel Faxina, Caroline Kaori e Arthur Tuccio
- **Turma:** _[Turma]_
- **Repositório GitHub:** https://github.com/joaogabrielfaxina44/AC04-python
- **Site (GitHub Pages):** https://joaogabrielfaxina44.github.io/AC04-python/

---

## 🎮 Regras do Jogo
- Pede um apelido não vazio (até 20 caracteres); somente o apelido é exposto nos resultados.
- Sorteia 9 perguntas sem repetição na ordem: 3 fáceis, 3 médias e 3 difíceis (banco com 15 perguntas sobre Python).
- Prêmio (fictício) após cada acerto, que **substitui** o anterior (não acumulativo):

| Acertos | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| **Prêmio** | R$ 1.000 | R$ 5.000 | R$ 10.000 | R$ 25.000 | R$ 50.000 | R$ 100.000 | R$ 200.000 | R$ 500.000 | R$ 1.000.000 |

- A partida termina no primeiro erro, ao desistir digitando `P` ou após acertar as 9 perguntas.
- O jogador mantém o último prêmio alcançado. Sem acertos, recebe R$ 0,00.
- O tempo da partida é medido via `time.perf_counter()` da primeira pergunta até o encerramento, **descontando** o tempo de menu e espera de rede do banco.
- Critérios de ordenação do Ranking: maior valor ganho > menor tempo em segundos > data mais antiga > id da partida (exibe apenas a melhor partida de cada apelido por jogo).

---

## 📁 Estrutura de Arquivos
```
banco/
  01_schema.sql        -> Estrutura das tabelas, view de ranking e permissões (RLS)
  02_perguntas.sql     -> 15 perguntas oficiais de Python com alternativas, gabarito e fontes
python/
  show_milhao.py       -> Programa principal do jogo no terminal
  test_regras.py       -> Testes automatizados unitários das regras e premiações
docs/                  -> Publicação web do GitHub Pages (HTML, CSS e JS)
Show_do_Milhao.ipynb   -> Caderno pronto para execução no Google Colab
prompts.md             -> Histórico cronológico de todos os prompts de IA e correções
TESTES.md              -> Roteiro de testes com resultados esperados, observados e correções
requirements.txt       -> Dependências de bibliotecas Python
.env.example           -> Modelo das variáveis de ambiente necessárias
```

---

## ⚙️ Como Configurar

### 1. Banco de Dados (Supabase)
1. Crie um projeto no [Supabase](https://supabase.com).
2. Acesse o **SQL Editor**, cole e execute o script `banco/01_schema.sql`.
3. Em seguida, cole e execute o script `banco/02_perguntas.sql`.
4. Em **Project Settings > API**, obtenha a **Project URL** e a chave pública **anon / publishable** (nunca use a `service_role`).

### 2. Executando o Jogo em Python
1. Copie o arquivo `.env.example` para `.env` na raiz do projeto e preencha com suas credenciais:
   ```env
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```
   *(Nota: O arquivo `.env` está no `.gitignore` e nunca deve ser compartilhado ou enviado ao repositório).*
2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
3. Execute o jogo:
   ```bash
   python python/show_milhao.py
   ```
4. Para rodar a suíte de testes unitários:
   ```bash
   python -m unittest python/test_regras.py -v
   ```

### 3. Executando no Google Colab (Opcional)
Se preferir executar sem instalar o Python localmente, abra o arquivo `Show_do_Milhao.ipynb` no Google Colab e execute as células sequencialmente.

---

## 🔒 Segurança e Permissões (RLS)
- **Tabela `perguntas`:** A chave pública (`anon`) possui permissão de leitura apenas nas colunas de enunciado e alternativas. A coluna `correta` (gabarito) é estritamente confidencial e nunca é enviada ao cliente; a conferência é feita no servidor via RPC `verificar_resposta()`.
- **Tabela `partidas`:** Permissão de inserção e leitura com RLS ativo. O cliente não pode alterar nem excluir registros existentes.
- **View `ranking`:** Consulta somente leitura pública, agregando a melhor pontuação de cada jogador por jogo.

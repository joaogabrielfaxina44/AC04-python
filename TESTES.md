# Roteiro e registro de testes

Registro detalhado dos testes realizados no Show do Milhão (Python + Supabase + Web).

| # | Teste | Esperado | Observado | Correção |
|---|---|---|---|---|
| 1 | 9 acertos | Prêmio R$ 1.000.000,00 (não somado), motivo vitória | Ao acertar as 9 perguntas seguidas, o prêmio final exibido e salvo foi R$ 1.000.000,00 com motivo 'vitoria'. | Nenhuma necessária (validado no cálculo e na restrição do banco). |
| 2 | Errar a 1ª pergunta | R$ 0,00 e partida encerrada | Partida encerrada imediatamente na pergunta 1 com prêmio R$ 0,00 e motivo 'erro'. | Nenhuma necessária. |
| 3 | Errar após alguns acertos | Prêmio do último acerto | Ao acertar 4 perguntas e errar a 5ª, manteve o prêmio de R$ 25.000,00 (não zerou e não somou). | Validado que o valor é substituído e não acumulado. |
| 4 | Desistir (`P`) após acertos | Mantém último prêmio | Ao digitar 'P' na 4ª pergunta, encerrou com motivo 'desistencia' garantindo R$ 10.000,00. | Nenhuma necessária. |
| 5 | Apelido vazio | Pede de novo | Pressionar ENTER com apelido vazio exibiu mensagem de erro e repetiu a solicitação. | Adicionada validação de espaço em branco (`strip`) e limite de 20 caracteres. |
| 6 | Alternativa inválida (ex.: `x`) | Pede de novo | Digitar 'x' ou valor fora de A/B/C/D/P exibiu aviso de entrada inválida sem queimar a pergunta. | Validação em loop `while` com checagem de alternativas válidas. |
| 7 | Ordem e repetição | 3 fáceis, 3 médias, 3 difíceis; sem repetidas | As perguntas 1 a 3 foram 'facil', 4 a 6 'media' e 7 a 9 'dificil', sem nenhuma duplicação de ID. | Implementado sorteio ordenado com verificação de não repetição (Fisher-Yates no JS e `random.sample` no Python). |
| 8 | Mesmo valor, tempos diferentes | Menor tempo na frente no ranking | Partida com R$ 25.000,00 em 30s ficou posicionada acima de partida com R$ 25.000,00 em 45s. | Ordem do ranking ajustada na view SQL (`valor_ganho DESC, tempo_segundos ASC`). |
| 9 | Mesmo apelido jogando 2x | Aparece só a melhor partida; as duas ficam em `partidas` | Ambas as partidas constam na tabela `partidas`, mas a view `ranking` exibe apenas o melhor resultado do jogador. | Uso de `DISTINCT ON (jogo_id, lower(apelido))` na view SQL. |
| 10 | Dois jogos diferentes | Rankings separados (filtro do site) | O filtro select do site e parâmetro `jogo_id` isolam corretamente as partidas de jogos distintos. | Criada view particionada por `jogo_id` com filtro dinâmico no frontend e terminal. |
| 11 | Falha de conexão ao salvar | Avisa falha, não confirma, oferece nova tentativa; ao reconectar salva 1 única vez | Ao simular falha de rede no envio, o jogo informou o erro, guardou na lista pendente e reenviou sem duplicar. | Uso de UUID fixo gerado no início da partida e tratamento do código HTTP 409 (id já existente). |
| 12 | Reabrir o programa e atualizar o site | Resultados continuam no banco | Fechar e reabrir o terminal ou recarregar o site mantém os resultados gravados no Supabase. | Nenhuma necessária (persistência online em nuvem). |
| 13 | Ranking vazio (jogo sem partidas) | Mensagem "Ainda não há partidas" | Ao selecionar jogo sem pontuações cadastradas, exibiu a mensagem de aviso na tabela e no terminal. | Tratamento de lista vazia retornado pela API REST. |
| 14 | Falha na consulta do site | Mensagem de erro | Ao testar com URL ou chave inválida, o site exibiu mensagem clara de falha de conexão. | Bloco `try/catch` com classe visual de erro no elemento `#ranking-mensagem`. |
| 15 | Site mostra R$ e tempo | `R$ 1.000.000,00` e `x min yy s` | Valores exibidos formatados em moeda brasileira (BRL) e duração discriminada em minutos e segundos. | Formatação padronizada com `Intl.NumberFormat` e cálculo de tempo em minutos/segundos. |

## Testes Automáticos de Regras
Para executar a bateria de testes unitários locais (não dependem de internet):
```bash
python -m unittest python/test_regras.py -v
```
Todos os 7 testes de regras (prêmios sem soma, limite de valores, ordem de dificuldade, ausência de repetição e formatações) foram aprovados com sucesso.


## Evidências Visuais das Partidas e Integração

As capturas de tela das execuções estão organizadas na pasta `evidencias/`:
1. `evidencias/01_supabase_sql.jpg`: Execução da liberação de RLS no SQL Editor do Supabase.
2. `evidencias/02_ranking_site.jpg`: Ranking oficial no GitHub Pages consultando os dados online com partidas registradas (identificando apelido `jg4`, prêmio `R$ 500.000,00`, acertos `8/9`, tempo `1 min 33 s` e data).

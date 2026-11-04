# Roteiro e registro de testes

Preencham "Observado" e "Correção" ao executar. Tirem capturas de tela (jogo Python + site da MESMA partida).

| # | Teste | Esperado | Observado | Correção |
|---|---|---|---|---|
| 1 | 9 acertos | Prêmio R$ 1.000.000,00 (não somado), motivo vitória | | |
| 2 | Errar a 1ª pergunta | R$ 0,00 e partida encerrada | | |
| 3 | Errar após alguns acertos | Prêmio do último acerto | | |
| 4 | Desistir (`P`) após acertos | Mantém último prêmio | | |
| 5 | Apelido vazio | Pede de novo | | |
| 6 | Alternativa inválida (ex.: `x`) | Pede de novo | | |
| 7 | Ordem e repetição | 3 fáceis, 3 médias, 3 difíceis; sem repetidas | | |
| 8 | Mesmo valor, tempos diferentes | Menor tempo na frente no ranking | | |
| 9 | Mesmo apelido jogando 2x | Aparece só a melhor partida; as duas ficam em `partidas` | | |
| 10 | Dois jogos diferentes | Rankings separados (filtro do site) | | |
| 11 | Falha de conexão ao salvar (desligar o Wi-Fi no fim da partida) | Avisa falha, não confirma, oferece nova tentativa; ao reconectar salva 1 única vez | | |
| 12 | Reabrir o programa e atualizar o site | Resultados continuam no banco | | |
| 13 | Ranking vazio (jogo sem partidas) | Mensagem "Ainda não há partidas" | | |
| 14 | Falha na consulta do site (URL errada em `config.js`) | Mensagem de erro | | |
| 15 | Site mostra R$ e tempo | `R$ 1.000.000,00` e `x min yy s` | | |

Testes automáticos (sem internet): `cd python; python -m unittest -v` → 7 testes (prêmios, ordem, repetição, formatação).

**Simular teste 11:** após terminar a partida, desconecte a internet antes de responder o salvamento, escolha `S` (tentar de novo) e reconecte; confira no Supabase (*Table Editor > partidas*) que há uma só linha com aquele `id`.

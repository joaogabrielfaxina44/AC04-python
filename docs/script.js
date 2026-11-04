const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.CONFIG;

// Tabelas de Regras
const PREMIOS = [0, 1000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000];
const NOME_JOGO = "Show do Milhão - Python";

// Estado da Partida
let jogoId = null;
let jogadorApelido = "";
let perguntasPartida = [];
let indicePerguntaAtual = 0;
let acertos = 0;
let tempoInicio = 0;
let timerInterval = null;
let partidaId = null;
let bloqueado = false;

// Elementos de Navegação
const btnAbaJogar = document.getElementById("aba-jogar-btn");
const btnAbaRanking = document.getElementById("aba-ranking-btn");
const secaoJogo = document.getElementById("secao-jogo");
const secaoRanking = document.getElementById("secao-ranking");

// Telas do Jogo
const telaInicio = document.getElementById("tela-inicio");
const telaPartida = document.getElementById("tela-partida");
const telaFim = document.getElementById("tela-fim");
const formInicio = document.getElementById("form-inicio");
const inputApelido = document.getElementById("input-apelido");

// Elementos da Partida
const txtProgresso = document.getElementById("txt-progresso");
const txtDificuldade = document.getElementById("txt-dificuldade");
const txtTempo = document.getElementById("txt-tempo");
const txtValorAcertar = document.getElementById("txt-valor-acertar");
const txtValorParar = document.getElementById("txt-valor-parar");
const txtEnunciado = document.getElementById("txt-enunciado");
const botoesAlt = document.querySelectorAll(".btn-alt");
const btnParar = document.getElementById("btn-parar");

// Fim de jogo
const fimTitulo = document.getElementById("fim-titulo");
const fimValor = document.getElementById("fim-valor");
const fimDetalhes = document.getElementById("fim-detalhes");
const fimStatusEnvio = document.getElementById("fim-status-envio");
const btnJogarNovamente = document.getElementById("btn-jogar-novamente");
const btnIrRanking = document.getElementById("btn-ir-ranking");

// Ranking
const selectJogo = document.getElementById("filtro-jogo");
const btnAtualizar = document.getElementById("btn-atualizar");
const rankingMensagem = document.getElementById("ranking-mensagem");
const tabelaRanking = document.getElementById("tabela-ranking");
const corpoRanking = document.getElementById("corpo-ranking");

// ==========================================
// FUNÇÕES AUXILIARES DA API SUPABASE
// ==========================================
async function api(caminho, opcoes = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${caminho}`;
  const cabecalhos = {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    ...opcoes.headers,
  };
  const resposta = await fetch(url, { ...opcoes, headers: cabecalhos });
  if (!resposta.ok) {
    const detalhe = await resposta.text();
    throw new Error(`Erro API ${resposta.status}: ${detalhe}`);
  }
  const contentType = resposta.headers.get("content-type");
  return contentType && contentType.includes("application/json") ? resposta.json() : null;
}

function formatarDinheiro(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(valor)
    .replace(/\u00a0/g, " ");
}

function formatarTempo(segundos) {
  const total = Math.round(Number(segundos));
  return `${Math.floor(total / 60)} min ${String(total % 60).padStart(2, "0")} s`;
}

function formatarData(iso) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// ==========================================
// NAVEGAÇÃO ENTRE ABAS
// ==========================================
function alternarAba(aba) {
  if (aba === "jogar") {
    btnAbaJogar.classList.add("ativa");
    btnAbaRanking.classList.remove("ativa");
    secaoJogo.hidden = false;
    secaoRanking.hidden = true;
  } else {
    btnAbaRanking.classList.add("ativa");
    btnAbaJogar.classList.remove("ativa");
    secaoJogo.hidden = true;
    secaoRanking.hidden = false;
    carregarRanking();
  }
}

btnAbaJogar.addEventListener("click", () => alternarAba("jogar"));
btnAbaRanking.addEventListener("click", () => alternarAba("ranking"));
btnIrRanking.addEventListener("click", () => alternarAba("ranking"));

// ==========================================
// LÓGICA DO JOGO NA WEB
// ==========================================
async function carregarJogoId() {
  if (jogoId) return jogoId;
  const jogos = await api(`jogos?select=id,nome&nome=eq.${encodeURIComponent(NOME_JOGO)}`);
  if (jogos && jogos.length > 0) {
    jogoId = jogos[0].id;
    return jogoId;
  }
  throw new Error("Jogo não encontrado no banco.");
}

async function sortearPerguntasBanco() {
  const todas = await api("perguntas?select=id,enunciado,alternativa_a,alternativa_b,alternativa_c,alternativa_d,dificuldade");
  const embaralhar = (lista) => lista.sort(() => Math.random() - 0.5);

  const faceis = embaralhar(todas.filter(p => p.dificuldade === "facil")).slice(0, 3);
  const medias = embaralhar(todas.filter(p => p.dificuldade === "media")).slice(0, 3);
  const dificeis = embaralhar(todas.filter(p => p.dificuldade === "dificil")).slice(0, 3);

  return [...faceis, ...medias, ...dificeis];
}

async function iniciarPartida(e) {
  e.preventDefault();
  const apelido = inputApelido.value.trim();
  if (!apelido) return;

  jogadorApelido = apelido;
  partidaId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : 'p_' + Date.now();
  acertos = 0;
  indicePerguntaAtual = 0;
  bloqueado = false;

  const btnSubmit = formInicio.querySelector("button");
  btnSubmit.disabled = true;
  btnSubmit.textContent = "Preparando perguntas...";

  try {
    await carregarJogoId();
    perguntasPartida = await sortearPerguntasBanco();
    if (perguntasPartida.length === 0) {
      alert("Nenhuma pergunta encontrada no banco de dados.");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Iniciar Partida 🚀";
      return;
    }

    telaInicio.hidden = true;
    telaFim.hidden = true;
    telaPartida.hidden = false;

    tempoInicio = performance.now();
    iniciarCronometro();
    exibirPerguntaAtual();
  } catch (erro) {
    alert("Falha ao conectar com o banco de dados: " + erro.message);
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Iniciar Partida 🚀";
  }
}

function iniciarCronometro() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const segundos = Math.floor((performance.now() - tempoInicio) / 1000);
    const m = String(Math.floor(segundos / 60)).padStart(2, "0");
    const s = String(segundos % 60).padStart(2, "0");
    txtTempo.textContent = `${m}:${s}`;
  }, 500);
}

function exibirPerguntaAtual() {
  bloqueado = false;
  const p = perguntasPartida[indicePerguntaAtual];
  const num = indicePerguntaAtual + 1;

  txtProgresso.textContent = `${num}/${perguntasPartida.length}`;
  txtDificuldade.textContent = p.dificuldade.toUpperCase();
  txtDificuldade.className = `status-valor badge-${p.dificuldade}`;

  txtValorAcertar.textContent = formatarDinheiro(PREMIOS[num]);
  txtValorParar.textContent = formatarDinheiro(PREMIOS[num - 1]);
  txtEnunciado.textContent = p.enunciado;

  botoesAlt.forEach(btn => {
    const letra = btn.dataset.letra;
    btn.querySelector(".alt-texto").textContent = p[`alternativa_${letra}`];
    btn.className = "btn-alt";
    btn.disabled = false;
  });
}

async function responder(letra, btnClicado) {
  if (bloqueado) return;
  bloqueado = true;

  const p = perguntasPartida[indicePerguntaAtual];
  btnClicado.style.transform = "scale(0.98)";

  try {
    // Valida no banco com a RPC (gabarito nunca sai do banco)
    const resposta = await api("rpc/verificar_resposta", {
      method: "POST",
      body: JSON.stringify({ p_id: p.id, p_resposta: letra }),
    });

    const acertou = resposta === true;

    if (acertou) {
      btnClicado.classList.add("correta");
      acertos++;
      setTimeout(() => {
        indicePerguntaAtual++;
        if (indicePerguntaAtual >= perguntasPartida.length) {
          finalizarPartida("vitoria");
        } else {
          exibirPerguntaAtual();
        }
      }, 900);
    } else {
      btnClicado.classList.add("errada");
      setTimeout(() => {
        finalizarPartida("erro");
      }, 1000);
    }
  } catch (e) {
    alert("Erro de conexão ao verificar a resposta. Tente clicar novamente.");
    bloqueado = false;
  }
}

botoesAlt.forEach(btn => {
  btn.addEventListener("click", () => responder(btn.dataset.letra, btn));
});

btnParar.addEventListener("click", () => {
  if (bloqueado) return;
  if (confirm(`Deseja parar agora e garantir ${formatarDinheiro(PREMIOS[acertos])}?`)) {
    finalizarPartida("desistencia");
  }
});

async function finalizarPartida(motivo) {
  clearInterval(timerInterval);
  const duracaoSegundos = Number(((performance.now() - tempoInicio) / 1000).toFixed(2));
  const premioFinal = PREMIOS[acertos];

  telaPartida.hidden = true;
  telaFim.hidden = false;

  fimValor.textContent = formatarDinheiro(premioFinal);
  const titulos = {
    vitoria: "🎉 PARABÉNS! VOCÊ É UM MILIONÁRIO!",
    desistencia: "🛑 Você optou por parar!",
    erro: "❌ Que pena, você errou!",
  };
  fimTitulo.textContent = titulos[motivo];
  fimDetalhes.textContent = `Jogador: ${jogadorApelido} • Acertos: ${acertos}/9 • Tempo: ${formatarTempo(duracaoSegundos)}`;

  // Salvar no Supabase
  fimStatusEnvio.textContent = "Gravando resultado no ranking oficial...";
  fimStatusEnvio.className = "status-envio";

  const dados = {
    id: partidaId,
    jogo_id: jogoId,
    apelido: jogadorApelido,
    valor_ganho: premioFinal,
    tempo_segundos: duracaoSegundos,
    acertos: acertos,
    motivo_encerramento: motivo,
    data_hora: new Date().toISOString(),
  };

  try {
    await api("partidas", {
      method: "POST",
      body: JSON.stringify(dados),
    });
    fimStatusEnvio.textContent = "✅ Resultado salvo no ranking com sucesso!";
    fimStatusEnvio.className = "status-envio sucesso";
  } catch (e) {
    fimStatusEnvio.textContent = "⚠️ Não foi possível salvar o resultado no banco. Verifique sua conexão.";
    fimStatusEnvio.className = "status-envio erro";
  }
}

btnJogarNovamente.addEventListener("click", () => {
  telaFim.hidden = true;
  telaInicio.hidden = false;
  inputApelido.focus();
});

formInicio.addEventListener("submit", iniciarPartida);

// ==========================================
// CONSULTA DO RANKING AO VIVO
// ==========================================
async function carregarJogosSelect() {
  const jogos = await api("jogos?select=id,nome&order=nome.asc");
  selectJogo.replaceChildren();
  for (const j of jogos) {
    const opt = document.createElement("option");
    opt.value = j.id;
    opt.textContent = j.nome;
    selectJogo.appendChild(opt);
  }
  return jogos.length;
}

async function carregarRanking() {
  if (!selectJogo.value) return;
  rankingMensagem.textContent = "Carregando melhores pontuações...";
  rankingMensagem.hidden = false;
  tabelaRanking.hidden = true;

  try {
    const linhas = await api(
      `ranking?select=posicao,jogo_nome,apelido,valor_ganho,tempo_segundos,acertos,data_hora` +
      `&jogo_id=eq.${encodeURIComponent(selectJogo.value)}&posicao=lte.10&order=posicao.asc`
    );

    if (!linhas || linhas.length === 0) {
      rankingMensagem.textContent = "Ainda não há partidas registradas neste jogo.";
      return;
    }

    corpoRanking.replaceChildren();
    for (const l of linhas) {
      const tr = document.createElement("tr");
      const tdPos = document.createElement("td");
      tdPos.textContent = `${l.posicao}º`;

      const tdNome = document.createElement("td");
      tdNome.textContent = l.apelido;

      const tdValor = document.createElement("td");
      tdValor.textContent = formatarDinheiro(l.valor_ganho);
      tdValor.className = "valor-ouro";

      const tdTempo = document.createElement("td");
      tdTempo.textContent = formatarTempo(l.tempo_segundos);

      const tdAcertos = document.createElement("td");
      tdAcertos.textContent = `${l.acertos}/9`;

      const tdData = document.createElement("td");
      tdData.textContent = formatarData(l.data_hora);

      tr.append(tdPos, tdNome, tdValor, tdTempo, tdAcertos, tdData);
      corpoRanking.appendChild(tr);
    }

    rankingMensagem.hidden = true;
    tabelaRanking.hidden = false;
  } catch (e) {
    rankingMensagem.textContent = "Erro ao consultar o ranking online.";
    rankingMensagem.className = "ranking-mensagem erro";
  }
}

selectJogo.addEventListener("change", carregarRanking);
btnAtualizar.addEventListener("click", carregarRanking);

// Inicialização
(async function init() {
  try {
    if (await carregarJogosSelect()) {
      await carregarRanking();
    }
  } catch (e) {
    rankingMensagem.textContent = "Não foi possível carregar o banco de dados.";
  }
})();

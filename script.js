// Carrega credenciais públicas do config.js
const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.CONFIG || {};

// Regras e Prêmios
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

// Helpers de formatação
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
  try {
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch (e) {
    return iso;
  }
}

// Comunicação com Supabase REST API
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

// Navegação entre Abas
window.alternarAba = function(aba) {
  const btnAbaJogar = document.getElementById("aba-jogar-btn");
  const btnAbaRanking = document.getElementById("aba-ranking-btn");
  const secaoJogo = document.getElementById("secao-jogo");
  const secaoRanking = document.getElementById("secao-ranking");

  if (!btnAbaJogar || !btnAbaRanking || !secaoJogo || !secaoRanking) return;

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
};

// Iniciar Partida
window.iniciarPartida = async function() {
  const inputApelido = document.getElementById("input-apelido");
  const btnIniciar = document.getElementById("btn-iniciar");
  const apelido = inputApelido ? inputApelido.value.trim() : "";

  if (!apelido) {
    alert("Por favor, digite seu apelido antes de começar.");
    if (inputApelido) inputApelido.focus();
    return;
  }

  jogadorApelido = apelido;
  partidaId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'p_' + Date.now();
  acertos = 0;
  indicePerguntaAtual = 0;
  bloqueado = false;

  if (btnIniciar) {
    btnIniciar.disabled = true;
    btnIniciar.textContent = "Preparando perguntas...";
  }

  try {
    // 1. Busca o ID do jogo no Supabase se ainda não tiver
    if (!jogoId) {
      const jogos = await api(`jogos?select=id,nome&nome=eq.${encodeURIComponent(NOME_JOGO)}`);
      if (jogos && jogos.length > 0) {
        jogoId = jogos[0].id;
      } else {
        throw new Error("Jogo não encontrado no banco de dados.");
      }
    }

    // 2. Busca e sorteia 3 fáceis, 3 médias e 3 difíceis
    const todas = await api("perguntas?select=id,enunciado,alternativa_a,alternativa_b,alternativa_c,alternativa_d,dificuldade");
    if (!todas || todas.length === 0) {
      throw new Error("Nenhuma pergunta encontrada no banco de dados.");
    }

    const embaralhar = (lista) => lista.sort(() => Math.random() - 0.5);
    const faceis = embaralhar(todas.filter(p => p.dificuldade === "facil")).slice(0, 3);
    const medias = embaralhar(todas.filter(p => p.dificuldade === "media")).slice(0, 3);
    const dificeis = embaralhar(todas.filter(p => p.dificuldade === "dificil")).slice(0, 3);

    perguntasPartida = [...faceis, ...medias, ...dificeis];

    // 3. Exibe tela de jogo
    document.getElementById("tela-inicio").hidden = true;
    document.getElementById("tela-fim").hidden = true;
    document.getElementById("tela-partida").hidden = false;

    tempoInicio = performance.now();
    iniciarCronometro();
    exibirPerguntaAtual();
  } catch (erro) {
    alert("Falha ao iniciar o jogo: " + erro.message);
  } finally {
    if (btnIniciar) {
      btnIniciar.disabled = false;
      btnIniciar.textContent = "Iniciar Partida 🚀";
    }
  }
};

function iniciarCronometro() {
  clearInterval(timerInterval);
  const txtTempo = document.getElementById("txt-tempo");
  timerInterval = setInterval(() => {
    if (!txtTempo) return;
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

  document.getElementById("txt-progresso").textContent = `${num}/${perguntasPartida.length}`;
  const txtDificuldade = document.getElementById("txt-dificuldade");
  txtDificuldade.textContent = p.dificuldade.toUpperCase();
  txtDificuldade.className = `status-valor badge-${p.dificuldade}`;

  document.getElementById("txt-valor-acertar").textContent = formatarDinheiro(PREMIOS[num]);
  document.getElementById("txt-valor-parar").textContent = formatarDinheiro(PREMIOS[num - 1]);
  document.getElementById("txt-enunciado").textContent = p.enunciado;

  const botoes = document.querySelectorAll(".btn-alt");
  botoes.forEach(btn => {
    const letra = btn.dataset.letra;
    btn.querySelector(".alt-texto").textContent = p[`alternativa_${letra}`];
    btn.className = "btn-alt";
    btn.disabled = false;
  });
}

// Resposta das alternativas
window.responderLetra = async function(letra, btnClicado) {
  if (bloqueado) return;
  bloqueado = true;

  const p = perguntasPartida[indicePerguntaAtual];
  btnClicado.style.transform = "scale(0.98)";

  try {
    // Valida no banco com a RPC (segurança: gabarito nunca sai do banco)
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
      }, 800);
    } else {
      btnClicado.classList.add("errada");
      setTimeout(() => {
        finalizarPartida("erro");
      }, 900);
    }
  } catch (e) {
    alert("Erro ao validar resposta com o servidor. Tente novamente.");
    bloqueado = false;
  }
};

window.pararPartida = function() {
  if (bloqueado) return;
  if (confirm(`Deseja parar agora e garantir ${formatarDinheiro(PREMIOS[acertos])}?`)) {
    finalizarPartida("desistencia");
  }
};

async function finalizarPartida(motivo) {
  clearInterval(timerInterval);
  const duracaoSegundos = Number(((performance.now() - tempoInicio) / 1000).toFixed(2));
  const premioFinal = PREMIOS[acertos];

  document.getElementById("tela-partida").hidden = true;
  document.getElementById("tela-fim").hidden = false;

  document.getElementById("fim-valor").textContent = formatarDinheiro(premioFinal);
  const titulos = {
    vitoria: "🎉 PARABÉNS! VOCÊ É UM MILIONÁRIO!",
    desistencia: "🛑 Você optou por parar!",
    erro: "❌ Que pena, você errou!",
  };
  document.getElementById("fim-titulo").textContent = titulos[motivo];
  document.getElementById("fim-detalhes").textContent = `Jogador: ${jogadorApelido} • Acertos: ${acertos}/9 • Tempo: ${formatarTempo(duracaoSegundos)}`;

  const fimStatusEnvio = document.getElementById("fim-status-envio");
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

window.reiniciarJogo = function() {
  document.getElementById("tela-fim").hidden = true;
  document.getElementById("tela-inicio").hidden = false;
  const input = document.getElementById("input-apelido");
  if (input) {
    input.value = "";
    input.focus();
  }
};

// ==========================================
// CONSULTA DO RANKING AO VIVO
// ==========================================
async function carregarJogosSelect() {
  const selectJogo = document.getElementById("filtro-jogo");
  if (!selectJogo) return 0;
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

window.carregarRanking = async function() {
  const selectJogo = document.getElementById("filtro-jogo");
  const rankingMensagem = document.getElementById("ranking-mensagem");
  const tabelaRanking = document.getElementById("tabela-ranking");
  const corpoRanking = document.getElementById("corpo-ranking");

  if (!selectJogo || !rankingMensagem || !tabelaRanking || !corpoRanking) return;
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
};

// Shims de compatibilidade (para nunca quebrar em chamadas legadas)
window.mostrarMensagem = function(t) {
  const el = document.getElementById("ranking-mensagem");
  if (el) el.textContent = t;
};
window.iniciar = function() {
  if (window.carregarRanking) window.carregarRanking();
};

// Inicialização automática ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  try {
    if (await carregarJogosSelect()) {
      await window.carregarRanking();
    }
  } catch (e) {
    console.warn("Aviso na inicialização do ranking:", e);
  }
});

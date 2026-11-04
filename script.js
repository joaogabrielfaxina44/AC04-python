const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.CONFIG;

const selectJogo = document.getElementById("filtro-jogo");
const botao = document.getElementById("btn-atualizar");
const mensagem = document.getElementById("mensagem");
const tabela = document.getElementById("tabela");
const corpo = document.getElementById("corpo");

// Consulta a API REST do Supabase (somente leitura).
async function consultar(caminho) {
  const resposta = await fetch(`${SUPABASE_URL}/rest/v1/${caminho}`, {
    headers: { apikey: SUPABASE_ANON_KEY },
  });
  if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);
  return resposta.json();
}

function formatarDinheiro(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(valor)
    .replace(/\u00a0/g, " "); // R$ 1.000.000,00
}

function formatarTempo(segundos) {
  const total = Math.round(Number(segundos));
  return `${Math.floor(total / 60)} min ${String(total % 60).padStart(2, "0")} s`;
}

function formatarData(iso) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? "erro" : "";
  tabela.hidden = true;
}

function celula(texto) {
  const td = document.createElement("td");
  td.textContent = texto; // textContent evita injeção de HTML pelo apelido
  return td;
}

async function carregarJogos() {
  const jogos = await consultar("jogos?select=id,nome&order=nome.asc");
  selectJogo.replaceChildren();
  for (const jogo of jogos) {
    const opcao = document.createElement("option");
    opcao.value = jogo.id;
    opcao.textContent = jogo.nome;
    selectJogo.appendChild(opcao);
  }
  return jogos.length;
}

async function carregarRanking() {
  if (!selectJogo.value) return mostrarMensagem("Nenhum jogo cadastrado.");
  mostrarMensagem("Carregando...");
  try {
    const linhas = await consultar(
      `ranking?select=posicao,jogo_nome,apelido,valor_ganho,tempo_segundos,data_hora` +
      `&jogo_id=eq.${encodeURIComponent(selectJogo.value)}&posicao=lte.10&order=posicao.asc`
    );
    if (linhas.length === 0) return mostrarMensagem("Ainda não há partidas para este jogo.");
    corpo.replaceChildren();
    for (const l of linhas) {
      const tr = document.createElement("tr");
      [l.posicao + "º", l.jogo_nome, l.apelido, formatarDinheiro(l.valor_ganho),
       formatarTempo(l.tempo_segundos), formatarData(l.data_hora)]
        .forEach((texto) => tr.appendChild(celula(texto)));
      corpo.appendChild(tr);
    }
    mensagem.textContent = "";
    tabela.hidden = false;
  } catch (e) {
    mostrarMensagem("Não foi possível consultar o ranking. Tente atualizar novamente.", true);
  }
}

async function iniciar() {
  try {
    if (await carregarJogos()) await carregarRanking();
    else mostrarMensagem("Nenhum jogo cadastrado.");
  } catch (e) {
    mostrarMensagem("Não foi possível consultar o banco de dados. Tente atualizar novamente.", true);
  }
}

botao.addEventListener("click", iniciar);
selectJogo.addEventListener("change", carregarRanking);
iniciar();

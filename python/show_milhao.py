"""Show do Milhão - Python (terminal) integrado ao Supabase.

Fluxo: menu -> jogar() -> calcular_premio() -> salvar_partida().
O banco é acessado pela API REST do Supabase (biblioteca requests).
"""
import os
import random
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Usa os certificados confiáveis do Windows para evitar erro de SSL em redes corporativas/acadêmicas
try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

import requests
from dotenv import load_dotenv

# Lê o arquivo .env da raiz do projeto (ele NÃO vai para o GitHub).
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")
NOME_JOGO = "Show do Milhão - Python"
TIMEOUT = 10  # segundos de espera por resposta do banco

# Prêmio pelo número de acertos (índice = acertos). Cada acerto SUBSTITUI o prêmio anterior.
PREMIOS = [0, 1000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000]
# Ordem da partida: (dificuldade, quantidade)
ESTRUTURA = [("facil", 3), ("media", 3), ("dificil", 3)]
LETRAS = ["a", "b", "c", "d"]

# Partidas que não puderam ser enviadas (ficam na memória até o programa fechar).
partidas_pendentes = []


class ErroBanco(Exception):
    """Falha ao falar com o banco (sem conexão, erro HTTP, etc.)."""

    def __init__(self, mensagem, status=None):
        super().__init__(mensagem)
        self.status = status


# ----------------------------------------------------------------------
# Acesso ao banco
# ----------------------------------------------------------------------
def requisitar(metodo, caminho, **kwargs):
    """Faz um pedido à API do Supabase e devolve a resposta (ou levanta ErroBanco)."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ErroBanco("Configure SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env.")
    try:
        resposta = requests.request(
            metodo,
            f"{SUPABASE_URL}/rest/v1/{caminho}",
            headers={"apikey": SUPABASE_KEY, "Content-Type": "application/json"},
            timeout=TIMEOUT,
            **kwargs,
        )
    except requests.RequestException:
        raise ErroBanco("Sem conexão com o banco de dados.")
    if resposta.status_code >= 400:
        raise ErroBanco(f"O banco recusou o pedido (código {resposta.status_code}).",
                        status=resposta.status_code)
    return resposta


def buscar_jogo_id():
    """Devolve o id do jogo na tabela 'jogos' (ou None se não existir)."""
    resposta = requisitar("GET", "jogos", params={"select": "id", "nome": f"eq.{NOME_JOGO}"})
    jogos = resposta.json()
    return jogos[0]["id"] if jogos else None


def sortear_perguntas(todas):
    """Sorteia até 3 perguntas por dificuldade, sem repetir, na ordem fácil > média > difícil."""
    sorteadas = []
    for dificuldade, quantidade in ESTRUTURA:
        da_dificuldade = [p for p in todas if p["dificuldade"] == dificuldade]
        if len(da_dificuldade) < quantidade:
            print(f"Aviso: só há {len(da_dificuldade)} pergunta(s) de nível '{dificuldade}'.")
        sorteadas += random.sample(da_dificuldade, min(quantidade, len(da_dificuldade)))
    return sorteadas


def buscar_perguntas():
    """Baixa as perguntas do banco (sem o gabarito) e devolve a lista sorteada da partida."""
    colunas = "id,enunciado,alternativa_a,alternativa_b,alternativa_c,alternativa_d,dificuldade"
    resposta = requisitar("GET", "perguntas", params={"select": colunas})
    return sortear_perguntas(resposta.json())


def verificar_resposta(pergunta_id, letra):
    """Pergunta ao banco se a letra está certa. O gabarito nunca sai do servidor."""
    resposta = requisitar("POST", "rpc/verificar_resposta",
                          json={"p_id": pergunta_id, "p_resposta": letra})
    return resposta.json() is True


# ----------------------------------------------------------------------
# Regras e formatação
# ----------------------------------------------------------------------
def calcular_premio(acertos):
    """Prêmio (R$ fictício) de quem fez 'acertos' acertos: valor da tabela, nunca somado."""
    acertos = max(0, min(acertos, len(PREMIOS) - 1))
    return PREMIOS[acertos]


def formatar_dinheiro(valor):
    """1000000 -> 'R$ 1.000.000,00'."""
    texto = f"{valor:,.2f}"  # 1,000,000.00
    return "R$ " + texto.replace(",", "X").replace(".", ",").replace("X", ".")


def formatar_tempo(segundos):
    """75.4 -> '1 min 15 s'."""
    total = int(round(float(segundos)))
    return f"{total // 60} min {total % 60:02d} s"


def formatar_data(texto_iso):
    """Converte a data ISO do banco para dd/mm/aaaa hh:mm no fuso do computador."""
    return datetime.fromisoformat(texto_iso).astimezone().strftime("%d/%m/%Y %H:%M")


# ----------------------------------------------------------------------
# Entrada do usuário
# ----------------------------------------------------------------------
def pedir_apelido():
    """Pede um apelido até receber um não vazio (máx. 20 caracteres)."""
    while True:
        apelido = input("Digite seu apelido: ").strip()
        if not apelido:
            print("O apelido não pode ser vazio. Tente de novo.")
        elif len(apelido) > 20:
            print("O apelido pode ter no máximo 20 caracteres. Tente de novo.")
        else:
            return apelido


def pedir_resposta():
    """Pede A, B, C, D ou P (parar) até receber uma entrada válida."""
    while True:
        escolha = input("Sua resposta [A/B/C/D] ou [P] para parar: ").strip().lower()
        if escolha in LETRAS or escolha == "p":
            return escolha
        print("Entrada inválida. Digite A, B, C, D ou P.")


def perguntar_sim_nao(texto):
    """Pergunta S/N até receber uma resposta válida. Devolve True para sim."""
    while True:
        escolha = input(f"{texto} [S/N]: ").strip().lower()
        if escolha in ("s", "n"):
            return escolha == "s"
        print("Digite S ou N.")


def mostrar_pergunta(numero, total, pergunta):
    premio_acertar = formatar_dinheiro(calcular_premio(numero))
    premio_parar = formatar_dinheiro(calcular_premio(numero - 1))
    print(f"\nPergunta {numero}/{total} ({pergunta['dificuldade']}) - vale {premio_acertar}")
    print(pergunta["enunciado"])
    for letra in LETRAS:
        print(f"  {letra.upper()}) {pergunta['alternativa_' + letra]}")
    print(f"(Se parar agora, você leva {premio_parar})")


def conferir_resposta(pergunta_id, letra):
    """Confere a resposta no banco; em caso de falha oferece nova tentativa.

    Devolve (acertou, segundos_gastos_no_banco). acertou é None se o jogador desistir de tentar.
    """
    gasto = 0.0
    while True:
        inicio = time.perf_counter()
        try:
            acertou = verificar_resposta(pergunta_id, letra)
            return acertou, gasto + time.perf_counter() - inicio
        except ErroBanco as erro:
            gasto += time.perf_counter() - inicio
            print(f"Falha ao conferir a resposta: {erro}")
            if not perguntar_sim_nao("Tentar novamente?"):
                return None, gasto


# ----------------------------------------------------------------------
# Jogo
# ----------------------------------------------------------------------
def jogar():
    """Roda uma partida completa e salva o resultado."""
    apelido = pedir_apelido()
    try:
        jogo_id = buscar_jogo_id()
        perguntas = buscar_perguntas()
    except ErroBanco as erro:
        print(f"Não foi possível iniciar: {erro}")
        return
    if jogo_id is None:
        print(f"O jogo '{NOME_JOGO}' não existe no banco. Rode o script SQL.")
        return
    if not perguntas:
        print("O banco não tem perguntas cadastradas. Rode o script de perguntas.")
        return

    partida_id = str(uuid.uuid4())  # um único id para esta partida, mesmo em reenvios
    acertos = 0
    motivo = "vitoria"
    tempo_banco = 0.0  # tempo esperando o banco, descontado do cronômetro
    inicio = time.perf_counter()  # começa na primeira pergunta

    for numero, pergunta in enumerate(perguntas, start=1):
        mostrar_pergunta(numero, len(perguntas), pergunta)
        escolha = pedir_resposta()
        if escolha == "p":
            motivo = "desistencia"
            break
        acertou, gasto = conferir_resposta(pergunta["id"], escolha)
        tempo_banco += gasto
        if acertou is None:
            print("Partida cancelada por falha de conexão. Nada foi salvo.")
            return
        if acertou:
            acertos += 1
            print(f"Correto! Você ganhou {formatar_dinheiro(calcular_premio(acertos))}.")
        else:
            motivo = "erro"
            print("Resposta errada!")
            break

    tempo = round(time.perf_counter() - inicio - tempo_banco, 2)  # cronômetro parado
    valor = calcular_premio(acertos)
    textos = {"erro": "errou uma pergunta", "desistencia": "desistiu", "vitoria": "acertou todas!"}
    print("\n===== FIM DA PARTIDA =====")
    print(f"Jogador: {apelido} | Motivo: {textos[motivo]}")
    print(f"Acertos: {acertos} | Prêmio: {formatar_dinheiro(valor)} | Tempo: {formatar_tempo(tempo)}")

    salvar_partida({
        "id": partida_id,
        "jogo_id": jogo_id,
        "apelido": apelido,
        "valor_ganho": valor,
        "tempo_segundos": tempo,
        "acertos": acertos,
        "motivo_encerramento": motivo,
        "data_hora": datetime.now(timezone.utc).isoformat(),
    })


def salvar_partida(partida):
    """Envia a partida ao banco. Só confirma se realmente salvou; senão oferece nova tentativa.

    O mesmo 'id' é reutilizado em cada tentativa: o banco recusa duplicatas (erro 409).
    """
    while True:
        try:
            requisitar("POST", "partidas", json=partida)
            salvo = True
        except ErroBanco as erro:
            # 409 = id já existe: um envio anterior chegou ao banco, não duplicamos.
            salvo = erro.status == 409
            if not salvo:
                print(f"Falha ao salvar o resultado: {erro}")
        if salvo:
            print("Resultado salvo com sucesso!")
            if partida in partidas_pendentes:
                partidas_pendentes.remove(partida)
            return True
        if partida not in partidas_pendentes:
            partidas_pendentes.append(partida)
        if not perguntar_sim_nao("Tentar enviar novamente?"):
            print("Resultado mantido na memória. Use 'Reenviar pendentes' no menu.")
            return False


def reenviar_pendentes():
    """Tenta enviar de novo as partidas que falharam."""
    for partida in list(partidas_pendentes):
        print(f"\nPartida de {partida['apelido']} ({formatar_dinheiro(partida['valor_ganho'])}):")
        salvar_partida(partida)


def consultar_ranking():
    """Mostra o top 10 do jogo (melhor partida de cada apelido)."""
    try:
        jogo_id = buscar_jogo_id()
        if jogo_id is None:
            print(f"O jogo '{NOME_JOGO}' não existe no banco.")
            return
        resposta = requisitar("GET", "ranking", params={
            "select": "posicao,apelido,valor_ganho,tempo_segundos,data_hora",
            "jogo_id": f"eq.{jogo_id}",
            "posicao": "lte.10",
            "order": "posicao.asc",
        })
    except ErroBanco as erro:
        print(f"Não foi possível consultar o ranking: {erro}")
        return
    linhas = resposta.json()
    if not linhas:
        print("Ainda não há partidas no ranking.")
        return
    print(f"\n===== RANKING - {NOME_JOGO} =====")
    print(f"{'Pos':<4}{'Apelido':<22}{'Valor':<18}{'Tempo':<12}Data")
    for item in linhas:
        print(f"{item['posicao']:<4}{item['apelido']:<22}"
              f"{formatar_dinheiro(item['valor_ganho']):<18}"
              f"{formatar_tempo(item['tempo_segundos']):<12}{formatar_data(item['data_hora'])}")


def menu():
    """Menu principal do programa."""
    while True:
        print("\n=== SHOW DO MILHÃO - PYTHON ===")
        print("1) Iniciar partida")
        print("2) Consultar ranking")
        if partidas_pendentes:
            print(f"3) Reenviar resultados pendentes ({len(partidas_pendentes)})")
        print("0) Sair")
        opcao = input("Escolha: ").strip()
        if opcao == "1":
            jogar()
        elif opcao == "2":
            consultar_ranking()
        elif opcao == "3" and partidas_pendentes:
            reenviar_pendentes()
        elif opcao == "0":
            if partidas_pendentes and not perguntar_sim_nao(
                    "Há resultados NÃO salvos que serão perdidos. Sair mesmo assim?"):
                continue
            print("Até a próxima!")
            break
        else:
            print("Opção inválida.")


if __name__ == "__main__":
    menu()

"""Testes automáticos das regras (não precisam de internet). Rode: python -m unittest -v"""
import unittest

import show_milhao as sm


def perguntas_falsas():
    todas = []
    for dificuldade in ("facil", "media", "dificil"):
        for i in range(5):
            todas.append({"id": len(todas) + 1, "dificuldade": dificuldade, "enunciado": f"{dificuldade}{i}"})
    return todas


class TestRegras(unittest.TestCase):
    def test_premios_da_tabela_sem_somar(self):
        esperado = {0: 0, 1: 1000, 2: 5000, 3: 10000, 4: 25000, 5: 50000,
                    6: 100000, 7: 200000, 8: 500000, 9: 1000000}
        for acertos, valor in esperado.items():
            self.assertEqual(sm.calcular_premio(acertos), valor)

    def test_premio_maximo_limitado(self):
        self.assertEqual(sm.calcular_premio(50), 1000000)
        self.assertEqual(sm.calcular_premio(-3), 0)

    def test_ordem_e_quantidade_das_dificuldades(self):
        sorteadas = sm.sortear_perguntas(perguntas_falsas())
        niveis = [p["dificuldade"] for p in sorteadas]
        self.assertEqual(niveis, ["facil"] * 3 + ["media"] * 3 + ["dificil"] * 3)

    def test_sem_perguntas_repetidas(self):
        for _ in range(200):
            ids = [p["id"] for p in sm.sortear_perguntas(perguntas_falsas())]
            self.assertEqual(len(ids), len(set(ids)))

    def test_faltando_perguntas_nao_quebra(self):
        so_faceis = [p for p in perguntas_falsas() if p["dificuldade"] == "facil"][:2]
        self.assertEqual(len(sm.sortear_perguntas(so_faceis)), 2)
        self.assertEqual(sm.sortear_perguntas([]), [])

    def test_formatar_dinheiro(self):
        self.assertEqual(sm.formatar_dinheiro(1000000), "R$ 1.000.000,00")
        self.assertEqual(sm.formatar_dinheiro(0), "R$ 0,00")
        self.assertEqual(sm.formatar_dinheiro(1000.0), "R$ 1.000,00")

    def test_formatar_tempo(self):
        self.assertEqual(sm.formatar_tempo(75.4), "1 min 15 s")
        self.assertEqual(sm.formatar_tempo(5), "0 min 05 s")


if __name__ == "__main__":
    unittest.main()

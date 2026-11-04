-- =====================================================================
-- 15 perguntas sobre Python (5 fáceis, 5 médias, 5 difíceis)
-- Rode DEPOIS do 01_schema.sql. Todas conferidas na documentação oficial
-- (coluna "fonte"). Revisem antes de entregar!
-- =====================================================================

insert into public.perguntas
    (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta, dificuldade, fonte)
values
-- ----------------------------- FÁCEIS -----------------------------
('Qual função do Python exibe um texto na tela?',
 'print()', 'show()', 'echo()', 'display()',
 'a', 'facil', 'https://docs.python.org/3/library/functions.html#print'),

('Qual é o tipo do valor 3.14 em Python?',
 'int', 'str', 'float', 'bool',
 'c', 'facil', 'https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex'),

('Qual símbolo inicia um comentário de uma linha em Python?',
 '//', '#', '--', '/*',
 'b', 'facil', 'https://docs.python.org/3/tutorial/introduction.html'),

('Qual função retorna a quantidade de itens de uma lista?',
 'size()', 'count()', 'len()', 'length()',
 'c', 'facil', 'https://docs.python.org/3/library/functions.html#len'),

('Qual palavra-chave é usada para definir uma função em Python?',
 'function', 'def', 'fun', 'define',
 'b', 'facil', 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions'),

-- ----------------------------- MÉDIAS -----------------------------
('Qual é o resultado de 10 // 3 em Python?',
 '3.33', '4', '3', '1',
 'c', 'media', 'https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex'),

('Qual método adiciona um item ao final de uma lista?',
 'add()', 'push()', 'insert()', 'append()',
 'd', 'media', 'https://docs.python.org/3/tutorial/datastructures.html#more-on-lists'),

('Qual é o resultado de "python"[1:4]?',
 'pyt', 'yth', 'ytho', 'tho',
 'b', 'media', 'https://docs.python.org/3/tutorial/introduction.html#strings'),

('Qual estrutura de dados do Python associa chaves a valores?',
 'list', 'tuple', 'set', 'dict',
 'd', 'media', 'https://docs.python.org/3/tutorial/datastructures.html#dictionaries'),

('Qual é o resultado de bool([]) em Python?',
 'True', 'False', 'None', 'Gera um erro',
 'b', 'media', 'https://docs.python.org/3/library/stdtypes.html#truth-value-testing'),

-- ----------------------------- DIFÍCEIS -----------------------------
('O que o código print(type(range(3))) exibe?',
 '<class ''list''>', '<class ''range''>', '<class ''tuple''>', '<class ''generator''>',
 'b', 'dificil', 'https://docs.python.org/3/library/stdtypes.html#ranges'),

('Com a = [1, 2, 3], depois b = a e depois b.append(4), qual é o valor de a?',
 '[1, 2, 3]', '[4]', '[1, 2, 3, 4]', 'Gera um erro',
 'c', 'dificil', 'https://docs.python.org/3/tutorial/datastructures.html#more-on-lists'),

('Qual é o resultado de [x * 2 for x in range(4) if x % 2 == 0]?',
 '[0, 2, 4, 6]', '[0, 4]', '[2, 6]', '[0, 2]',
 'b', 'dificil', 'https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions'),

('Dado def f(x, l=[]): l.append(x); return l — o que retorna a segunda chamada, f(2), após já ter chamado f(1)?',
 '[2]', '[1]', 'Gera um erro', '[1, 2]',
 'd', 'dificil', 'https://docs.python.org/3/tutorial/controlflow.html#default-argument-values'),

('Qual cláusula de try/except é executada sempre, mesmo que ocorra uma exceção?',
 'else', 'except', 'finally', 'pass',
 'c', 'dificil', 'https://docs.python.org/3/tutorial/errors.html#defining-clean-up-actions');

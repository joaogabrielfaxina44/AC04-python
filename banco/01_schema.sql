-- =====================================================================
-- Show do Milhão - Python | Esquema do banco (Supabase / PostgreSQL)
-- Rode este arquivo INTEIRO no Supabase: SQL Editor > New query > Run.
-- Pode ser rodado de novo para recriar tudo (apaga os dados!).
-- =====================================================================

drop view     if exists public.ranking;
drop function if exists public.verificar_resposta(bigint, text);
drop table    if exists public.partidas;
drop table    if exists public.perguntas;
drop table    if exists public.jogos;

-- ---------------------------------------------------------------------
-- TABELAS
-- ---------------------------------------------------------------------
create table public.jogos (
    id   bigint generated always as identity primary key,
    nome text not null unique
);

create table public.perguntas (
    id            bigint generated always as identity primary key,
    enunciado     text not null,
    alternativa_a text not null,
    alternativa_b text not null,
    alternativa_c text not null,
    alternativa_d text not null,
    correta       text not null check (correta in ('a', 'b', 'c', 'd')),
    dificuldade   text not null check (dificuldade in ('facil', 'media', 'dificil')),
    fonte         text not null  -- onde o gabarito foi conferido
);

create table public.partidas (
    id                  uuid primary key,  -- gerado pelo Python (uuid4); reutilizado nos reenvios
    jogo_id             bigint        not null references public.jogos (id),
    apelido             text          not null
                        check (apelido = btrim(apelido) and char_length(apelido) between 1 and 20),
    valor_ganho         numeric(12,2) not null,
    tempo_segundos      numeric(10,2) not null check (tempo_segundos >= 0),
    acertos             integer       not null check (acertos between 0 and 9),
    motivo_encerramento text          not null
                        check (motivo_encerramento in ('erro', 'desistencia', 'vitoria')),
    data_hora           timestamptz   not null default now(),
    -- o valor precisa bater com a tabela de prêmios para o número de acertos
    constraint valor_confere_com_acertos check (
        valor_ganho = case acertos
            when 0 then 0       when 1 then 1000    when 2 then 5000
            when 3 then 10000   when 4 then 25000   when 5 then 50000
            when 6 then 100000  when 7 then 200000  when 8 then 500000
            when 9 then 1000000
        end
    )
);

create index partidas_jogo_idx on public.partidas (jogo_id, apelido);

-- ---------------------------------------------------------------------
-- RANKING: melhor partida de cada apelido, por jogo.
-- Ordem: maior valor_ganho > menor tempo > data mais antiga > menor id.
-- ---------------------------------------------------------------------
create view public.ranking as
with melhores as (
    select distinct on (p.jogo_id, lower(p.apelido)) p.*
    from public.partidas p
    order by p.jogo_id, lower(p.apelido),
             p.valor_ganho desc, p.tempo_segundos asc, p.data_hora asc, p.id asc
)
select
    j.id   as jogo_id,
    j.nome as jogo_nome,
    m.apelido,
    m.valor_ganho,
    m.tempo_segundos,
    m.acertos,
    m.data_hora,
    m.id   as partida_id,
    row_number() over (
        partition by m.jogo_id
        order by m.valor_ganho desc, m.tempo_segundos asc, m.data_hora asc, m.id asc
    ) as posicao
from melhores m
join public.jogos j on j.id = m.jogo_id;

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO DE RESPOSTA NO SERVIDOR
-- O gabarito (coluna "correta") NUNCA sai do banco: quem joga só
-- pergunta "esta letra está certa?" e recebe true/false.
-- ---------------------------------------------------------------------
create function public.verificar_resposta(p_id bigint, p_resposta text)
returns boolean
language sql
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.perguntas
        where id = p_id and correta = lower(p_resposta)
    );
$$;

-- ---------------------------------------------------------------------
-- PERMISSÕES (chave pública "anon" = a única usada pelo Python e pelo site)
-- ---------------------------------------------------------------------
alter table public.jogos     enable row level security;
alter table public.perguntas enable row level security;
alter table public.partidas  enable row level security;

-- começa tirando tudo (o Supabase concede acesso amplo por padrão)
revoke all on public.jogos, public.perguntas, public.partidas, public.ranking
    from anon, authenticated;
revoke all on function public.verificar_resposta(bigint, text) from public, anon, authenticated;

-- jogos: leitura
grant select on public.jogos to anon;
create policy "jogos_leitura" on public.jogos for select to anon using (true);

-- perguntas: leitura SOMENTE das colunas sem o gabarito
grant select (id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, dificuldade)
    on public.perguntas to anon;
create policy "perguntas_leitura" on public.perguntas for select to anon using (true);

-- partidas: só inserir (nada de ler, alterar ou apagar)
grant insert on public.partidas to anon;
create policy "partidas_insercao" on public.partidas for insert to anon with check (true);

-- ranking: só leitura (a view acessa "partidas" com os direitos do dono)
grant select on public.ranking to anon;

-- função de conferir resposta
grant execute on function public.verificar_resposta(bigint, text) to anon;

-- ---------------------------------------------------------------------
-- DADOS INICIAIS
-- ---------------------------------------------------------------------
insert into public.jogos (nome) values ('Show do Milhão - Python');

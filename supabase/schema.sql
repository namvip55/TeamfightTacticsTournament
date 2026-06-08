create extension if not exists "pgcrypto";

create table if not exists tournaments (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    status text not null default 'registration_open',
    registration_open boolean not null default true,
    locked boolean not null default false,
    created_at timestamptz not null default now()
);

create table if not exists players (
    id uuid primary key default gen_random_uuid(),
    discord_id text not null unique,
    discord_username text,
    riot_id text not null,
    game_name text not null,
    tag_line text not null,
    puuid text not null unique,
    created_at timestamptz not null default now()
);

create table if not exists lobbies (
    id uuid primary key default gen_random_uuid(),
    tournament_id uuid not null references tournaments(id) on delete cascade,
    name text not null,
    status text not null default 'open',
    created_at timestamptz not null default now(),
    unique(tournament_id, name)
);

create table if not exists lobby_players (
    id uuid primary key default gen_random_uuid(),
    tournament_id uuid not null references tournaments(id) on delete cascade,
    lobby_id uuid not null references lobbies(id) on delete cascade,
    player_id uuid not null references players(id) on delete cascade,
    discord_id text not null,
    riot_id text not null,
    puuid text not null,
    placement int,
    points int not null default 0,
    match_id text,
    verified boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(tournament_id, player_id)
);

create table if not exists match_results (
    id uuid primary key default gen_random_uuid(),
    tournament_id uuid not null references tournaments(id) on delete cascade,
    lobby_id uuid not null references lobbies(id) on delete cascade,
    match_id text not null unique,
    raw_data jsonb,
    created_at timestamptz not null default now()
);

create table if not exists standings (
    id uuid primary key default gen_random_uuid(),
    tournament_id uuid not null references tournaments(id) on delete cascade,
    player_id uuid not null references players(id) on delete cascade,
    discord_id text not null,
    riot_id text not null,
    puuid text not null,
    total_points int not null default 0,
    games_played int not null default 0,
    total_wins int not null default 0,
    total_top4 int not null default 0,
    total_placement int not null default 0,
    avg_placement numeric not null default 0,
    updated_at timestamptz not null default now(),
    unique(tournament_id, player_id)
);

create index if not exists idx_tournaments_created_at on tournaments(created_at desc);

create index if not exists idx_players_discord_id on players(discord_id);
create index if not exists idx_players_puuid on players(puuid);

create index if not exists idx_lobbies_tournament_id on lobbies(tournament_id);

create index if not exists idx_lobby_players_tournament_id on lobby_players(tournament_id);
create index if not exists idx_lobby_players_lobby_id on lobby_players(lobby_id);
create index if not exists idx_lobby_players_player_id on lobby_players(player_id);
create index if not exists idx_lobby_players_puuid on lobby_players(puuid);

create index if not exists idx_match_results_tournament_id on match_results(tournament_id);
create index if not exists idx_match_results_lobby_id on match_results(lobby_id);
create index if not exists idx_match_results_match_id on match_results(match_id);

create index if not exists idx_standings_tournament_id on standings(tournament_id);
create index if not exists idx_standings_player_id on standings(player_id);
create index if not exists idx_standings_rank on standings(tournament_id, total_points desc, avg_placement asc);


create table if not exists match_player_results (
    id uuid primary key default gen_random_uuid(),

    tournament_id uuid not null references tournaments(id) on delete cascade,
    lobby_id uuid not null references lobbies(id) on delete cascade,
    match_result_id uuid references match_results(id) on delete cascade,

    match_id text not null,
    player_id uuid not null references players(id) on delete cascade,

    discord_id text not null,
    riot_id text not null,
    puuid text not null,

    placement int not null,
    points int not null default 0,
    verified boolean not null default true,

    created_at timestamptz not null default now(),

    unique(match_id, player_id)
);

create index if not exists idx_match_player_results_tournament_id on match_player_results(tournament_id);
create index if not exists idx_match_player_results_lobby_id on match_player_results(lobby_id);
create index if not exists idx_match_player_results_match_id on match_player_results(match_id);
create index if not exists idx_match_player_results_player_id on match_player_results(player_id);
create index if not exists idx_match_player_results_rank on match_player_results(tournament_id, points desc, placement asc);


alter table tournaments
add column if not exists mode text not null default 'normal';

alter table tournaments
add column if not exists checkmate_score int not null default 20;

alter table tournaments
add column if not exists winner_player_id uuid references players(id) on delete set null;

alter table tournaments
add column if not exists winner_riot_id text;

alter table tournaments
add column if not exists winner_discord_id text;

alter table tournaments
add column if not exists finished_at timestamptz;


-- =====================================================
-- NEW TABLES: Diamond, Trophy, Shop, Profile System
-- =====================================================

-- Extend players table with profile fields
ALTER TABLE players ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE players ADD COLUMN IF NOT EXISTS bio text DEFAULT '';
ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE players ADD COLUMN IF NOT EXISTS discord_avatar_url text;
ALTER TABLE players ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';
ALTER TABLE players ADD COLUMN IF NOT EXISTS diamonds int NOT NULL DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Diamond transactions history
CREATE TABLE IF NOT EXISTS diamond_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    amount int NOT NULL,
    reason text NOT NULL,
    tournament_id uuid REFERENCES tournaments(id) ON DELETE SET NULL,
    admin_note text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_diamond_transactions_player ON diamond_transactions(player_id);
CREATE INDEX IF NOT EXISTS idx_diamond_transactions_tournament ON diamond_transactions(tournament_id);

-- Trophies (achievements)
CREATE TABLE IF NOT EXISTS trophies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    trophy_type text NOT NULL DEFAULT 'champion',
    tournament_name text NOT NULL,
    awarded_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(player_id, tournament_id, trophy_type)
);
CREATE INDEX IF NOT EXISTS idx_trophies_player ON trophies(player_id);
CREATE INDEX IF NOT EXISTS idx_trophies_tournament ON trophies(tournament_id);

-- Shop items
CREATE TABLE IF NOT EXISTS shop_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price int NOT NULL,
    item_type text NOT NULL,
    item_data jsonb DEFAULT '{}',
    stock int,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Shop purchases history
CREATE TABLE IF NOT EXISTS shop_purchases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    diamonds_spent int NOT NULL,
    status text NOT NULL DEFAULT 'completed',
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_player ON shop_purchases(player_id);

-- TFT Rank Caching
ALTER TABLE players ADD COLUMN IF NOT EXISTS tft_tier text;
ALTER TABLE players ADD COLUMN IF NOT EXISTS tft_rank text;
ALTER TABLE players ADD COLUMN IF NOT EXISTS tft_lp int;
ALTER TABLE players ADD COLUMN IF NOT EXISTS tft_wins int;
ALTER TABLE players ADD COLUMN IF NOT EXISTS tft_losses int;
ALTER TABLE players ADD COLUMN IF NOT EXISTS tft_rank_updated_at timestamptz;

-- =====================================================
-- NEW TABLES: TFT Team Compositions
-- =====================================================
CREATE TABLE IF NOT EXISTS tft_comps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  description     text DEFAULT '',
  tier            text,       -- S / A / B / C (optional for user comps)
  carry_api_name  text,       -- apiName carry, VD: "TFT17_Annie" (optional for user comps)
  units           jsonb NOT NULL DEFAULT '[]',
  -- [{ apiName, name, cost, items: [apiName], isCarry, isFlex, position }]
  traits          jsonb NOT NULL DEFAULT '[]',
  -- [{ apiName, name, count }]
  augments        jsonb DEFAULT '[]',     -- ưu tiên (KHÔNG phải win rate — tuân thủ policy Riot)
  -- [{ apiName, name, image }]
  early_units     jsonb DEFAULT '[]',     -- tướng đầu trận
  cover_image_url text,                  -- URL ảnh cover (Supabase Storage)
  is_active       boolean DEFAULT true,
  -- User-created comp fields
  creator_discord_id text,               -- Discord ID of creator
  creator_riot_id    text,               -- Riot ID of creator
  difficulty         text DEFAULT 'medium', -- easy, medium, hard
  playstyle          text DEFAULT 'balanced', -- aggressive, balanced, defensive, economy, flex
  items              jsonb DEFAULT '{}',  -- {"unit_name": ["item1", "item2"]}
  upvotes            int DEFAULT 0,       -- Community upvotes
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
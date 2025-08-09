-- Supabase schema for DigPikasoClone

create table if not exists user_credits (
    user_id text primary key,
    credits int not null default 100,
    updated_at timestamptz default now()
);

create table if not exists images (
    id uuid primary key default gen_random_uuid(),
    user_id text,
    public_url text,
    created_at timestamptz default now()
);

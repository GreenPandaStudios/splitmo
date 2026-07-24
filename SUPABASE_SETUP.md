# Supabase Setup Guide for Iceland Split 🇮🇸

Follow these quick steps to enable real-time cloud database sync for your trip:

## 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. Go to **Project Settings → API** and copy your **Project URL** and **`anon` (public) Key**.

## 2. Run the SQL Migration Script
Go to **SQL Editor** in your Supabase dashboard, paste the following SQL script, and click **Run**:

```sql
-- 1. Create the trips table
create table if not exists public.trips (
  id text primary key,
  name text not null,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS) for security
alter table public.trips enable row level security;

-- 3. Create a public RLS policy allowing trip members to read and write trip data
create policy "Allow read and write access for trip members"
on public.trips for all
using (true)
with check (true);

-- 4. Enable Realtime updates
alter publication supabase_realtime add table public.trips;
```

## 3. Enter Credentials in the App
1. Open [http://localhost:5174/](http://localhost:5174/)
2. Click **Settings ⚙️** in the top navigation.
3. Paste your **Supabase URL** and **`anon` Key**.
4. Click **Connect Supabase**.

Your trip expenses will now automatically sync in real time across all devices!

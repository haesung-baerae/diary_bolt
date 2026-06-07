/*
# Create diary_entries table

## Summary
Creates the core table for the self-esteem diary app. Each row represents
one day's diary entry for a specific authenticated user. Users can record
three things they did well that day.

## New Tables

### diary_entries
- `id` — UUID primary key, auto-generated
- `user_id` — owner reference to auth.users; defaults to the calling user's auth.uid() so the client does NOT need to pass it on insert
- `date` — the calendar date the entry is for (date type, not timestamp)
- `thing1` — first "thing I did well today" (text, may be empty)
- `thing2` — second good thing (text, may be empty)
- `thing3` — third good thing (text, may be empty)
- `created_at` — row creation timestamp
- UNIQUE constraint on (user_id, date) — one entry per user per day

## Security
- RLS enabled: only the owner can read/write their own entries
- Four separate policies (SELECT, INSERT, UPDATE, DELETE), each scoped to `authenticated`
- `user_id` defaults to `auth.uid()` so inserts that omit the column still satisfy the INSERT policy

## Notes
1. The UNIQUE(user_id, date) constraint means an upsert (or update) pattern is safe for the "save entry" flow.
2. thing1/thing2/thing3 use empty-string defaults so a partial save (user only filled one) does not error.
*/

CREATE TABLE IF NOT EXISTS diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  thing1 text NOT NULL DEFAULT '',
  thing2 text NOT NULL DEFAULT '',
  thing3 text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_diary_entries" ON diary_entries;
CREATE POLICY "select_own_diary_entries" ON diary_entries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_diary_entries" ON diary_entries;
CREATE POLICY "insert_own_diary_entries" ON diary_entries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_diary_entries" ON diary_entries;
CREATE POLICY "update_own_diary_entries" ON diary_entries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_diary_entries" ON diary_entries;
CREATE POLICY "delete_own_diary_entries" ON diary_entries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

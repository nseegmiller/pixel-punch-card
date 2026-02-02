-- Pixel Punch Card Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (name <> ''),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on user_id for habits
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  is_current BOOLEAN DEFAULT TRUE NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes on cards
CREATE INDEX IF NOT EXISTS idx_cards_habit_id ON cards(habit_id);
CREATE INDEX IF NOT EXISTS idx_cards_habit_is_current ON cards(habit_id, is_current);

-- Create unique constraint: only one current card per habit
CREATE UNIQUE INDEX IF NOT EXISTS idx_cards_one_current_per_habit
  ON cards(habit_id)
  WHERE is_current = TRUE;

-- Create history table
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('punch', 'habit_create', 'habit_edit', 'habit_delete')),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  timezone TEXT,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes on history
CREATE INDEX IF NOT EXISTS idx_history_user_created ON history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_card_id ON history(card_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own habits" ON habits;
DROP POLICY IF EXISTS "Users can insert own habits" ON habits;
DROP POLICY IF EXISTS "Users can update own habits" ON habits;
DROP POLICY IF EXISTS "Users can delete own habits" ON habits;

DROP POLICY IF EXISTS "Users can view cards for own habits" ON cards;
DROP POLICY IF EXISTS "Users can insert cards for own habits" ON cards;
DROP POLICY IF EXISTS "Users can update cards for own habits" ON cards;
DROP POLICY IF EXISTS "Users can delete cards for own habits" ON cards;

DROP POLICY IF EXISTS "Users can view own history" ON history;
DROP POLICY IF EXISTS "Users can insert own history" ON history;
DROP POLICY IF EXISTS "Users can delete own history" ON history;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Habits RLS policies
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Cards RLS policies
CREATE POLICY "Users can view cards for own habits"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = cards.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cards for own habits"
  ON cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = cards.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards for own habits"
  ON cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = cards.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards for own habits"
  ON cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = cards.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- History RLS policies
CREATE POLICY "Users can view own history"
  ON history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON history FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to auto-create first card when habit is created
CREATE OR REPLACE FUNCTION create_first_card_for_habit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO cards (habit_id, is_current)
  VALUES (NEW.id, TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_create_first_card ON habits;

-- Create trigger on habit insert
CREATE TRIGGER trigger_create_first_card
  AFTER INSERT ON habits
  FOR EACH ROW
  EXECUTE FUNCTION create_first_card_for_habit();

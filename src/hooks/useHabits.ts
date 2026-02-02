import { useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Habit, Card, History } from '@/types';
import { validateHabitName } from '@/utils/validation';

export interface HabitWithCard extends Habit {
  currentCard: Card | null;
  completedCardsCount: number;
  punches: History[];
}

export const useHabits = (userId: string | undefined) => {
  const fetchHabits = useCallback(async (): Promise<HabitWithCard[]> => {
    if (!userId) return [];

    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (habitsError) throw habitsError;
    if (!habits) return [];

    const habitIds = habits.map((h) => h.id);
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .in('habit_id', habitIds)
      .order('created_at', { ascending: true });

    if (cardsError) throw cardsError;

    const cardIds = cards?.map((c) => c.id) || [];
    const { data: punches, error: punchesError } = await supabase
      .from('history')
      .select('*')
      .eq('event_type', 'punch')
      .in('card_id', cardIds)
      .order('created_at', { ascending: true });

    if (punchesError) throw punchesError;

    return habits.map((habit) => {
      const habitCards = cards?.filter((c) => c.habit_id === habit.id) || [];
      const currentCard = habitCards.find((c) => c.is_current) || null;
      const completedCardsCount = habitCards.filter((c) => !c.is_current && c.completed_at).length;
      const habitPunches = punches?.filter((p) => p.card_id === currentCard?.id) || [];

      return {
        ...habit,
        currentCard,
        completedCardsCount,
        punches: habitPunches,
      };
    });
  }, [userId]);

  const createHabit = useCallback(
    async (name: string): Promise<Habit> => {
      if (!userId) throw new Error('User not authenticated');

      const validationError = validateHabitName(name);
      if (validationError) throw new Error(validationError);

      const trimmedName = name.trim();

      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .insert({
          user_id: userId,
          name: trimmedName,
        })
        .select()
        .single();

      if (habitError) throw habitError;

      const { error: historyError } = await supabase.from('history').insert({
        user_id: userId,
        event_type: 'habit_create',
        habit_id: habit.id,
        event_data: {
          habit_id: habit.id,
          name: trimmedName,
        },
      });

      if (historyError) throw historyError;

      return habit;
    },
    [userId]
  );

  const updateHabit = useCallback(
    async (habitId: string, name: string, oldName: string): Promise<void> => {
      if (!userId) throw new Error('User not authenticated');

      const validationError = validateHabitName(name);
      if (validationError) throw new Error(validationError);

      const trimmedName = name.trim();

      const { error: updateError } = await supabase
        .from('habits')
        .update({
          name: trimmedName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', habitId)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      const { error: historyError } = await supabase.from('history').insert({
        user_id: userId,
        event_type: 'habit_edit',
        habit_id: habitId,
        event_data: {
          habit_id: habitId,
          old_name: oldName,
          new_name: trimmedName,
        },
      });

      if (historyError) throw historyError;
    },
    [userId]
  );

  const deleteHabit = useCallback(
    async (habitId: string): Promise<void> => {
      if (!userId) throw new Error('User not authenticated');

      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .eq('user_id', userId)
        .single();

      if (habitError) throw habitError;

      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('habit_id', habitId);

      if (cardsError) throw cardsError;

      const cardIds = cards?.map((c) => c.id) || [];
      const { data: punches, error: punchesError } = await supabase
        .from('history')
        .select('*')
        .eq('event_type', 'punch')
        .in('card_id', cardIds);

      if (punchesError) throw punchesError;

      const { error: historyError } = await supabase.from('history').insert({
        user_id: userId,
        event_type: 'habit_delete',
        habit_id: habitId,
        event_data: {
          habit: {
            id: habit.id,
            name: habit.name,
            created_at: habit.created_at,
            updated_at: habit.updated_at,
          },
          cards:
            cards?.map((c) => ({
              id: c.id,
              is_current: c.is_current,
              completed_at: c.completed_at,
              created_at: c.created_at,
            })) || [],
          punches:
            punches?.map((p) => ({
              id: p.id,
              card_id: p.card_id!,
              timezone: p.timezone!,
              created_at: p.created_at,
            })) || [],
        },
      });

      if (historyError) throw historyError;

      const { error: deleteError } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;
    },
    [userId]
  );

  return useMemo(
    () => ({
      fetchHabits,
      createHabit,
      updateHabit,
      deleteHabit,
    }),
    [fetchHabits, createHabit, updateHabit, deleteHabit]
  );
};

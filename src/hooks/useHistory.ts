import { useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { History, HabitDeleteEvent, HistoryInsert } from '@/types';
import { getUserTimezone } from '@/utils/timezone';
import { PUNCHES_PER_CARD, DEFAULT_HISTORY_FETCH_LIMIT } from '@/utils/constants';

export interface PunchResult {
  completed: boolean;
}

export const useHistory = (userId: string | undefined) => {
  const punch = useCallback(
    async (cardId: string, customTimestamp?: string): Promise<PunchResult> => {
      if (!userId) throw new Error('User not authenticated');

      const timezone = getUserTimezone();

      const { data: existingPunches, error: countError } = await supabase
        .from('history')
        .select('id')
        .eq('event_type', 'punch')
        .eq('card_id', cardId);

      if (countError) throw countError;

      const currentCount = existingPunches?.length || 0;

      if (currentCount >= PUNCHES_PER_CARD) {
        throw new Error('Card is already full');
      }

      // Get the habit_id from the card so we can link the punch to the habit
      const { data: card, error: cardFetchError } = await supabase
        .from('cards')
        .select('habit_id')
        .eq('id', cardId)
        .single();

      if (cardFetchError) throw cardFetchError;

      // Build the punch record
      const punchRecord: HistoryInsert = {
        user_id: userId,
        event_type: 'punch',
        card_id: cardId,
        habit_id: card.habit_id,
        timezone,
        ...(customTimestamp && { created_at: customTimestamp }),
      };

      const { error: punchError } = await supabase.from('history').insert(punchRecord);

      if (punchError) throw punchError;

      const newCount = currentCount + 1;

      if (newCount === PUNCHES_PER_CARD) {
        // Use cached card data from earlier fetch
        const { error: updateError } = await supabase
          .from('cards')
          .update({
            is_current: false,
            completed_at: new Date().toISOString(),
          })
          .eq('id', cardId);

        if (updateError) throw updateError;

        const { error: newCardError } = await supabase.from('cards').insert({
          habit_id: card.habit_id,
          is_current: true,
        });

        if (newCardError) throw newCardError;

        return { completed: true };
      }

      return { completed: false };
    },
    [userId]
  );

  const unpunch = useCallback(
    async (historyId: string): Promise<void> => {
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('history')
        .delete()
        .eq('id', historyId)
        .eq('user_id', userId)
        .eq('event_type', 'punch');

      if (error) throw error;
    },
    [userId]
  );

  const fetchRecentHistory = useCallback(
    async (limit = DEFAULT_HISTORY_FETCH_LIMIT): Promise<History[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    [userId]
  );

  const undo = useCallback(async (): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');

    const { data: recentHistory, error: fetchError } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error('No actions to undo');
      }
      throw fetchError;
    }

    if (!recentHistory) {
      throw new Error('No actions to undo');
    }

    switch (recentHistory.event_type) {
      case 'punch':
        await unpunch(recentHistory.id);
        break;

      case 'habit_create':
        if (recentHistory.habit_id) {
          const { error: deleteHabitError } = await supabase
            .from('habits')
            .delete()
            .eq('id', recentHistory.habit_id)
            .eq('user_id', userId);

          if (deleteHabitError) throw deleteHabitError;

          const { error: deleteHistoryError } = await supabase
            .from('history')
            .delete()
            .eq('id', recentHistory.id);

          if (deleteHistoryError) throw deleteHistoryError;
        }
        break;

      case 'habit_edit':
        if (recentHistory.habit_id && recentHistory.event_data) {
          const eventData = recentHistory.event_data as { old_name: string };
          const { error: updateError } = await supabase
            .from('habits')
            .update({
              name: eventData.old_name,
              updated_at: new Date().toISOString(),
            })
            .eq('id', recentHistory.habit_id)
            .eq('user_id', userId);

          if (updateError) throw updateError;

          const { error: deleteHistoryError } = await supabase
            .from('history')
            .delete()
            .eq('id', recentHistory.id);

          if (deleteHistoryError) throw deleteHistoryError;
        }
        break;

      case 'habit_delete':
        if (recentHistory.event_data) {
          const eventData = recentHistory.event_data as unknown as HabitDeleteEvent;

          const { error: habitError } = await supabase.from('habits').insert([
            {
              id: eventData.habit.id,
              user_id: userId,
              name: eventData.habit.name,
              created_at: eventData.habit.created_at,
              updated_at: eventData.habit.updated_at,
            },
          ]);

          if (habitError) throw habitError;

          if (eventData.cards.length > 0) {
            const cardsToInsert = eventData.cards.map((card) => ({
              id: card.id,
              habit_id: eventData.habit.id,
              is_current: card.is_current,
              completed_at: card.completed_at,
              created_at: card.created_at,
            }));

            const { error: cardsError } = await supabase.from('cards').insert(cardsToInsert);

            if (cardsError) throw cardsError;
          }

          if (eventData.punches.length > 0) {
            const punchesToInsert = eventData.punches.map((p) => ({
              id: p.id,
              user_id: userId,
              event_type: 'punch' as const,
              card_id: p.card_id,
              timezone: p.timezone,
              created_at: p.created_at,
            }));

            const { error: punchesError } = await supabase.from('history').insert(punchesToInsert);

            if (punchesError) throw punchesError;
          }

          const { error: deleteHistoryError } = await supabase
            .from('history')
            .delete()
            .eq('id', recentHistory.id);

          if (deleteHistoryError) throw deleteHistoryError;
        }
        break;
    }
  }, [userId, unpunch]);

  return useMemo(
    () => ({
      punch,
      unpunch,
      fetchRecentHistory,
      undo,
    }),
    [punch, unpunch, fetchRecentHistory, undo]
  );
};

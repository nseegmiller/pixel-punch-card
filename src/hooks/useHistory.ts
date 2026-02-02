import { supabase } from '@/lib/supabase';
import { History, HabitDeleteEvent } from '@/types';
import { getUserTimezone } from '@/utils/timezone';
import { PUNCHES_PER_CARD } from '@/utils/constants';

export interface PunchResult {
  completed: boolean;
}

export const useHistory = (userId: string | undefined) => {
  const punch = async (cardId: string): Promise<PunchResult> => {
    if (!userId) throw new Error('User not authenticated');

    const timezone = getUserTimezone();

    // Check current punch count
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

    // Create punch history entry
    const { error: punchError } = await supabase
      .from('history')
      .insert({
        user_id: userId,
        event_type: 'punch',
        card_id: cardId,
        timezone,
      });

    if (punchError) throw punchError;

    const newCount = currentCount + 1;

    // If this was the 10th punch, complete the card
    if (newCount === PUNCHES_PER_CARD) {
      // Get habit_id from card
      const { data: card, error: cardError } = await supabase
        .from('cards')
        .select('habit_id')
        .eq('id', cardId)
        .single();

      if (cardError) throw cardError;

      // Mark current card as completed
      const { error: updateError } = await supabase
        .from('cards')
        .update({
          is_current: false,
          completed_at: new Date().toISOString(),
        })
        .eq('id', cardId);

      if (updateError) throw updateError;

      // Create new card for the habit
      const { error: newCardError } = await supabase
        .from('cards')
        .insert({
          habit_id: card.habit_id,
          is_current: true,
        });

      if (newCardError) throw newCardError;

      return { completed: true };
    }

    return { completed: false };
  };

  const unpunch = async (historyId: string): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');

    // Delete the punch history entry
    const { error } = await supabase
      .from('history')
      .delete()
      .eq('id', historyId)
      .eq('user_id', userId)
      .eq('event_type', 'punch');

    if (error) throw error;
  };

  const fetchRecentHistory = async (limit = 100): Promise<History[]> => {
    if (!userId) return [];

    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  };

  const undo = async (): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');

    // Get most recent history entry
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

    // Perform undo based on event type
    switch (recentHistory.event_type) {
      case 'punch':
        // Delete the punch (same as unpunch)
        await unpunch(recentHistory.id);
        break;

      case 'habit_create':
        // Delete the habit (cascades to cards and history)
        if (recentHistory.habit_id) {
          const { error: deleteHabitError } = await supabase
            .from('habits')
            .delete()
            .eq('id', recentHistory.habit_id)
            .eq('user_id', userId);

          if (deleteHabitError) throw deleteHabitError;

          // Delete the history entry
          const { error: deleteHistoryError } = await supabase
            .from('history')
            .delete()
            .eq('id', recentHistory.id);

          if (deleteHistoryError) throw deleteHistoryError;
        }
        break;

      case 'habit_edit':
        // Restore old habit name
        if (recentHistory.habit_id && recentHistory.event_data) {
          const eventData = recentHistory.event_data as unknown as { old_name: string };
          const { error: updateError } = await supabase
            .from('habits')
            .update({
              name: eventData.old_name,
              updated_at: new Date().toISOString(),
            })
            .eq('id', recentHistory.habit_id)
            .eq('user_id', userId);

          if (updateError) throw updateError;

          // Delete the history entry
          const { error: deleteHistoryError } = await supabase
            .from('history')
            .delete()
            .eq('id', recentHistory.id);

          if (deleteHistoryError) throw deleteHistoryError;
        }
        break;

      case 'habit_delete':
        // Restore the deleted habit, cards, and punches
        if (recentHistory.event_data) {
          const eventData = recentHistory.event_data as unknown as HabitDeleteEvent;

          // Re-insert habit
          const { error: habitError } = await supabase
            .from('habits')
            .insert([{
              id: eventData.habit.id,
              user_id: userId,
              name: eventData.habit.name,
              created_at: eventData.habit.created_at,
              updated_at: eventData.habit.updated_at,
            }]);

          if (habitError) throw habitError;

          // Re-insert cards
          if (eventData.cards.length > 0) {
            const { error: cardsError } = await supabase
              .from('cards')
              .insert(eventData.cards.map(card => ({
                id: card.id,
                habit_id: eventData.habit.id,
                is_current: card.is_current,
                completed_at: card.completed_at,
                created_at: card.created_at,
                // Temporary type assertion until Supabase types are regenerated
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              })) as any);

            if (cardsError) throw cardsError;
          }

          // Re-insert punches
          if (eventData.punches.length > 0) {
            const { error: punchesError } = await supabase
              .from('history')
              .insert(eventData.punches.map(punch => ({
                id: punch.id,
                user_id: userId,
                event_type: 'punch' as const,
                card_id: punch.card_id,
                timezone: punch.timezone,
                created_at: punch.created_at,
                // Temporary type assertion until Supabase types are regenerated
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              })) as any);

            if (punchesError) throw punchesError;
          }

          // Delete the history entry
          const { error: deleteHistoryError } = await supabase
            .from('history')
            .delete()
            .eq('id', recentHistory.id);

          if (deleteHistoryError) throw deleteHistoryError;
        }
        break;
    }
  };

  return {
    punch,
    unpunch,
    fetchRecentHistory,
    undo,
  };
};

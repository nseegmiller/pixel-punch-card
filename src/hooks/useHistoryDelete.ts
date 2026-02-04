import { useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { EventType } from '@/types';

export const useHistoryDelete = (userId: string | undefined) => {
  return useMemo(() => {
    const deleteHistoryEntry = async (historyId: string, eventType: EventType) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // For all event types, we simply delete the history entry
      // Punches: Removes the punch from history and the slot becomes empty
      // Other events: Removes from activity log only
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('id', historyId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting history entry:', error);
        throw new Error(`Failed to delete ${eventType} event`);
      }
    };

    return {
      deleteHistoryEntry,
    };
  }, [userId]);
};

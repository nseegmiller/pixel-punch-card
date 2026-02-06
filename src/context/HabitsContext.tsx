import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useHabits as useHabitsHook, HabitWithCard } from '@/hooks/useHabits';
import { useHistory as useHistoryHook, PunchResult } from '@/hooks/useHistory';
import { useHistoryDelete } from '@/hooks/useHistoryDelete';
import { History, EventType } from '@/types';
import { supabase } from '@/lib/supabase';
import { DEFAULT_HISTORY_FETCH_LIMIT } from '@/utils/constants';

interface HabitsContextType {
  habits: HabitWithCard[];
  loading: boolean;
  error: string | null;
  recentHistory: History[];
  createHabit: (name: string) => Promise<void>;
  updateHabit: (habitId: string, name: string, oldName: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  punch: (cardId: string, customTimestamp?: string) => Promise<PunchResult>;
  unpunch: (historyId: string) => Promise<void>;
  undo: () => Promise<void>;
  deleteHistoryEntry: (historyId: string, eventType: EventType) => Promise<void>;
  refresh: () => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const useHabitsContext = () => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabitsContext must be used within HabitsProvider');
  }
  return context;
};

export const HabitsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithCard[]>([]);
  const [recentHistory, setRecentHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;
  const habitsHook = useHabitsHook(userId);
  const historyHook = useHistoryHook(userId);
  const historyDeleteHook = useHistoryDelete(userId);

  const refresh = useCallback(async () => {
    if (!userId) {
      setHabits([]);
      setRecentHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [fetchedHabits, fetchedHistory] = await Promise.all([
        habitsHook.fetchHabits(),
        historyHook.fetchRecentHistory(DEFAULT_HISTORY_FETCH_LIMIT),
      ]);
      setHabits(fetchedHabits);
      setRecentHistory(fetchedHistory);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [userId, habitsHook, historyHook]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'history',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const createHabit = useCallback(
    async (name: string) => {
      try {
        setError(null);
        await habitsHook.createHabit(name);
        await refresh();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create habit';
        setError(errorMessage);
        throw err;
      }
    },
    [habitsHook, refresh]
  );

  const updateHabit = useCallback(
    async (habitId: string, name: string, oldName: string) => {
      try {
        setError(null);
        await habitsHook.updateHabit(habitId, name, oldName);
        await refresh();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update habit';
        setError(errorMessage);
        throw err;
      }
    },
    [habitsHook, refresh]
  );

  const deleteHabit = useCallback(
    async (habitId: string) => {
      try {
        setError(null);
        await habitsHook.deleteHabit(habitId);
        await refresh();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete habit';
        setError(errorMessage);
        throw err;
      }
    },
    [habitsHook, refresh]
  );

  const punch = useCallback(
    async (cardId: string, customTimestamp?: string): Promise<PunchResult> => {
      try {
        setError(null);
        const result = await historyHook.punch(cardId, customTimestamp);
        await refresh();
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to punch card';
        setError(errorMessage);
        throw err;
      }
    },
    [historyHook, refresh]
  );

  const unpunch = useCallback(
    async (historyId: string) => {
      try {
        setError(null);
        await historyHook.unpunch(historyId);
        await refresh();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to unpunch';
        setError(errorMessage);
        throw err;
      }
    },
    [historyHook, refresh]
  );

  const undo = useCallback(async () => {
    try {
      setError(null);
      await historyHook.undo();
      await refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to undo';
      setError(errorMessage);
      throw err;
    }
  }, [historyHook, refresh]);

  const deleteHistoryEntry = useCallback(
    async (historyId: string, eventType: EventType) => {
      try {
        setError(null);
        await historyDeleteHook.deleteHistoryEntry(historyId, eventType);
        await refresh();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete history entry';
        setError(errorMessage);
        throw err;
      }
    },
    [historyDeleteHook, refresh]
  );

  return (
    <HabitsContext.Provider
      value={{
        habits,
        loading,
        error,
        recentHistory,
        createHabit,
        updateHabit,
        deleteHabit,
        punch,
        unpunch,
        undo,
        deleteHistoryEntry,
        refresh,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};

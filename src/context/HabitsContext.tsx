import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useHabits as useHabitsHook, HabitWithCard } from '@/hooks/useHabits';
import { useHistory as useHistoryHook, PunchResult } from '@/hooks/useHistory';
import { History } from '@/types';
import { supabase } from '@/lib/supabase';

interface HabitsContextType {
  habits: HabitWithCard[];
  loading: boolean;
  error: string | null;
  recentHistory: History[];
  createHabit: (name: string) => Promise<void>;
  updateHabit: (habitId: string, name: string, oldName: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  punch: (cardId: string) => Promise<PunchResult>;
  unpunch: (historyId: string) => Promise<void>;
  undo: () => Promise<void>;
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

  const habitsHook = useHabitsHook(user?.id);
  const historyHook = useHistoryHook(user?.id);

  const refresh = useCallback(async () => {
    if (!user) {
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
        historyHook.fetchRecentHistory(100),
      ]);
      setHabits(fetchedHabits);
      setRecentHistory(fetchedHistory);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Subscribe to real-time changes on history table
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'history',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const createHabit = async (name: string) => {
    try {
      setError(null);
      await habitsHook.createHabit(name);
      await refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create habit';
      setError(errorMessage);
      throw err;
    }
  };

  const updateHabit = async (habitId: string, name: string, oldName: string) => {
    try {
      setError(null);
      await habitsHook.updateHabit(habitId, name, oldName);
      await refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update habit';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      setError(null);
      await habitsHook.deleteHabit(habitId);
      await refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete habit';
      setError(errorMessage);
      throw err;
    }
  };

  const punch = async (cardId: string): Promise<PunchResult> => {
    try {
      setError(null);
      const result = await historyHook.punch(cardId);
      await refresh();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to punch card';
      setError(errorMessage);
      throw err;
    }
  };

  const unpunch = async (historyId: string) => {
    try {
      setError(null);
      await historyHook.unpunch(historyId);
      await refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unpunch';
      setError(errorMessage);
      throw err;
    }
  };

  const undo = async () => {
    try {
      setError(null);
      await historyHook.undo();
      await refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to undo';
      setError(errorMessage);
      throw err;
    }
  };

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
        refresh,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};

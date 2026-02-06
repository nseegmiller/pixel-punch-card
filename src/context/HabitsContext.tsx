import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
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

    // Debounce refresh to prevent flicker from rapid real-time updates
    let refreshTimeout: NodeJS.Timeout;

    const debouncedRefresh = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        refresh();
      }, 100); // 100ms debounce
    };

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
          debouncedRefresh();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(refreshTimeout);
      supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const createHabit = useCallback(
    async (name: string) => {
      if (!userId) throw new Error('User not authenticated');

      // Create optimistic habit with temporary ID
      const tempId = `temp-habit-${Date.now()}`;
      const tempHistoryId = `temp-history-${Date.now()}`;
      const optimisticHabit: HabitWithCard = {
        id: tempId,
        user_id: userId,
        name: name.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        currentCard: {
          id: `temp-card-${Date.now()}`,
          habit_id: tempId,
          is_current: true,
          completed_at: null,
          created_at: new Date().toISOString(),
        },
        completedCardsCount: 0,
        punches: [],
      };

      const optimisticHistory: History = {
        id: tempHistoryId,
        user_id: userId,
        event_type: 'habit_create',
        card_id: null,
        habit_id: tempId,
        timezone: null,
        event_data: { habit_id: tempId, name: name.trim() },
        created_at: new Date().toISOString(),
      };

      // Optimistically add habit and history entry
      setHabits((prevHabits) => [...prevHabits, optimisticHabit]);
      setRecentHistory((prev) => [optimisticHistory, ...prev]);

      try {
        setError(null);
        await habitsHook.createHabit(name);
        // Real-time subscription will handle the refresh
      } catch (err) {
        // Roll back optimistic update on error
        setHabits((prevHabits) => prevHabits.filter((h) => h.id !== tempId));
        setRecentHistory((prev) => prev.filter((h) => h.id !== tempHistoryId));

        const errorMessage = err instanceof Error ? err.message : 'Failed to create habit';
        setError(errorMessage);
        throw err;
      }
    },
    [userId, habitsHook]
  );

  const updateHabit = useCallback(
    async (habitId: string, name: string, oldName: string) => {
      if (!userId) throw new Error('User not authenticated');

      const tempHistoryId = `temp-history-${Date.now()}`;
      const optimisticHistory: History = {
        id: tempHistoryId,
        user_id: userId,
        event_type: 'habit_edit',
        card_id: null,
        habit_id: habitId,
        timezone: null,
        event_data: { habit_id: habitId, old_name: oldName, new_name: name.trim() },
        created_at: new Date().toISOString(),
      };

      // Optimistically update habit name and add history entry
      setHabits((prevHabits) =>
        prevHabits.map((habit) => {
          if (habit.id === habitId) {
            return { ...habit, name: name.trim() };
          }
          return habit;
        })
      );

      setRecentHistory((prev) => [optimisticHistory, ...prev]);

      try {
        setError(null);
        await habitsHook.updateHabit(habitId, name, oldName);
        // Real-time subscription will handle the refresh
      } catch (err) {
        // Roll back optimistic update on error
        setHabits((prevHabits) =>
          prevHabits.map((habit) => {
            if (habit.id === habitId) {
              return { ...habit, name: oldName };
            }
            return habit;
          })
        );

        setRecentHistory((prev) => prev.filter((h) => h.id !== tempHistoryId));

        const errorMessage = err instanceof Error ? err.message : 'Failed to update habit';
        setError(errorMessage);
        throw err;
      }
    },
    [userId, habitsHook]
  );

  const deleteHabit = useCallback(
    async (habitId: string) => {
      if (!userId) throw new Error('User not authenticated');

      const tempHistoryId = `temp-history-${Date.now()}`;
      let deletedHabit: HabitWithCard;
      let habitIndex: number;

      // Find and capture habit before removing
      setHabits((prevHabits) => {
        const index = prevHabits.findIndex((h) => h.id === habitId);
        if (index === -1) {
          throw new Error('Habit not found');
        }
        habitIndex = index;
        deletedHabit = prevHabits[index];
        return prevHabits.filter((h) => h.id !== habitId);
      });

      // TypeScript needs this assertion since deletedHabit is assigned in callback
      if (!deletedHabit!) throw new Error('Habit not found');

      const optimisticHistory: History = {
        id: tempHistoryId,
        user_id: userId,
        event_type: 'habit_delete',
        card_id: null,
        habit_id: habitId,
        timezone: null,
        event_data: {
          habit: {
            id: deletedHabit!.id,
            name: deletedHabit!.name,
            created_at: deletedHabit!.created_at,
            updated_at: deletedHabit!.updated_at,
          },
          cards: [],
          punches: [],
        },
        created_at: new Date().toISOString(),
      };

      setRecentHistory((prev) => [optimisticHistory, ...prev]);

      try {
        setError(null);
        await habitsHook.deleteHabit(habitId);
        // Real-time subscription will handle the refresh
      } catch (err) {
        // Roll back optimistic update on error - restore to original position
        setHabits((prevHabits) => {
          const restored = [...prevHabits];
          restored.splice(habitIndex!, 0, deletedHabit!);
          return restored;
        });
        setRecentHistory((prev) => prev.filter((h) => h.id !== tempHistoryId));

        const errorMessage = err instanceof Error ? err.message : 'Failed to delete habit';
        setError(errorMessage);
        throw err;
      }
    },
    [userId, habitsHook]
  );

  const punch = useCallback(
    async (cardId: string, customTimestamp?: string): Promise<PunchResult> => {
      if (!userId) throw new Error('User not authenticated');

      const tempId = `temp-punch-${Date.now()}`;
      let habitId: string | null = null;

      // Optimistically update habits and find habitId inside the setter
      setHabits((prevHabits) =>
        prevHabits.map((h) => {
          if (h.currentCard?.id === cardId) {
            habitId = h.id;
            const optimisticPunch: History = {
              id: tempId,
              user_id: userId,
              event_type: 'punch',
              card_id: cardId,
              habit_id: h.id,
              timezone: null,
              event_data: null,
              created_at: customTimestamp || new Date().toISOString(),
            };
            return {
              ...h,
              punches: [...h.punches, optimisticPunch].sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              ),
            };
          }
          return h;
        })
      );

      if (!habitId) throw new Error('Card not found');

      const optimisticPunch: History = {
        id: tempId,
        user_id: userId,
        event_type: 'punch',
        card_id: cardId,
        habit_id: habitId,
        timezone: null,
        event_data: null,
        created_at: customTimestamp || new Date().toISOString(),
      };

      setRecentHistory((prev) => [optimisticPunch, ...prev]);

      try {
        setError(null);

        // Call database operation - real-time subscription will handle the refresh
        const result = await historyHook.punch(cardId, customTimestamp);

        return result;
      } catch (err) {
        // Roll back optimistic update on error
        setHabits((prevHabits) =>
          prevHabits.map((h) => {
            if (h.currentCard?.id === cardId) {
              return {
                ...h,
                punches: h.punches.filter((p) => p.id !== tempId),
              };
            }
            return h;
          })
        );

        setRecentHistory((prev) => prev.filter((h) => h.id !== tempId));

        const errorMessage = err instanceof Error ? err.message : 'Failed to punch card';
        setError(errorMessage);
        throw err;
      }
    },
    [userId, historyHook]
  );

  const unpunch = useCallback(
    async (historyId: string) => {
      if (!userId) throw new Error('User not authenticated');

      // Store the punch we're removing for rollback
      let removedPunch: History | null = null;
      let affectedHabitId: string | null = null;

      // Optimistically remove punch from BOTH habits and recentHistory
      setHabits((prevHabits) =>
        prevHabits.map((habit) => {
          const punchIndex = habit.punches.findIndex((p) => p.id === historyId);
          if (punchIndex !== -1) {
            removedPunch = habit.punches[punchIndex];
            affectedHabitId = habit.id;
            return {
              ...habit,
              punches: habit.punches.filter((p) => p.id !== historyId),
            };
          }
          return habit;
        })
      );

      setRecentHistory((prev) => prev.filter((h) => h.id !== historyId));

      try {
        setError(null);
        await historyHook.unpunch(historyId);
      } catch (err) {
        // Roll back optimistic update on error
        if (removedPunch && affectedHabitId) {
          setHabits((prevHabits) =>
            prevHabits.map((habit) => {
              if (habit.id === affectedHabitId) {
                return {
                  ...habit,
                  punches: [...habit.punches, removedPunch!].sort(
                    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  ),
                };
              }
              return habit;
            })
          );

          setRecentHistory((prev) =>
            [removedPunch!, ...prev].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
          );
        }

        const errorMessage = err instanceof Error ? err.message : 'Failed to unpunch';
        setError(errorMessage);
        throw err;
      }
    },
    [userId, historyHook]
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
      // Store the entry we're deleting for rollback
      const deletedEntry = recentHistory.find((h) => h.id === historyId);
      if (!deletedEntry) throw new Error('History entry not found');

      // Optimistically remove from recentHistory
      setRecentHistory((prev) => prev.filter((h) => h.id !== historyId));

      // If it's a punch, also remove from habits
      if (eventType === 'punch') {
        setHabits((prevHabits) =>
          prevHabits.map((habit) => {
            const punchIndex = habit.punches.findIndex((p) => p.id === historyId);
            if (punchIndex !== -1) {
              return {
                ...habit,
                punches: habit.punches.filter((p) => p.id !== historyId),
              };
            }
            return habit;
          })
        );
      }

      try {
        setError(null);
        await historyDeleteHook.deleteHistoryEntry(historyId, eventType);
        // Real-time subscription will handle the refresh
      } catch (err) {
        // Roll back optimistic update on error
        setRecentHistory((prev) =>
          [deletedEntry, ...prev].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        );

        if (eventType === 'punch') {
          setHabits((prevHabits) =>
            prevHabits.map((habit) => {
              if (habit.id === deletedEntry.habit_id) {
                return {
                  ...habit,
                  punches: [...habit.punches, deletedEntry].sort(
                    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  ),
                };
              }
              return habit;
            })
          );
        }

        const errorMessage = err instanceof Error ? err.message : 'Failed to delete history entry';
        setError(errorMessage);
        throw err;
      }
    },
    [historyDeleteHook, recentHistory]
  );

  const value = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
};

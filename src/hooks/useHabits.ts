import { useCallback, useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Habit = {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  created_at: string;
  user_id: string;
  current_streak: number; // ✨ Stored in database!
  last_completed: string | null; // ✨ Last completion date
};

type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
};

// ============================================================================
// ULTRA-OPTIMIZED HOOK
// No loops, no calculations, just simple queries!
// ============================================================================

export function useHabits(currentUserId: string | null) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  // ==========================================================================
  // FETCH FUNCTIONS - SUPER SIMPLE!
  // ==========================================================================

  /**
   * Fetch habits - streaks already stored in database!
   * No calculation needed, just SELECT and done!
   */
  const fetchHabits = useCallback(async () => {
    if (!currentUserId) return;

    setLoading(true);

    // ✨ Just fetch habits - streaks are already there!
    const { data, error } = await supabase
      .from("habits")
      .select("*") // Includes current_streak and last_completed
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching habits:", error);
    } else {
      setHabits(data || []);
    }

    setLoading(false);
  }, [currentUserId]);

  /**
   * Fetch today's logs for checkmarks
   * Small dataset, very fast
   */
  const fetchTodaysLogs = useCallback(async () => {
    if (!currentUserId) return;

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", currentUserId)
      .eq("completed_date", today);

    if (error) {
      console.error("Error fetching today's logs:", error);
    } else {
      setHabitLogs(data || []);
    }
  }, [currentUserId]);

  // ==========================================================================
  // INITIAL LOAD
  // ==========================================================================

  useEffect(() => {
    if (currentUserId) {
      fetchHabits();
      fetchTodaysLogs();
    }
  }, [currentUserId, fetchHabits, fetchTodaysLogs]);

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  const isCompletedToday = (habitId: string): boolean => {
    return habitLogs.some((log) => log.habit_id === habitId);
  };

  // ==========================================================================
  // CRUD OPERATIONS
  // ==========================================================================

  /**
   * Mark habit as complete
   * Database trigger automatically updates streak!
   * We just insert the log and refetch
   */
  const handleMarkComplete = async (habitId: string) => {
    if (!currentUserId) return;

    const today = new Date().toISOString().split("T")[0];

    // Insert log - trigger will update streak automatically!
    const { data, error } = await supabase
      .from("habit_logs")
      .insert([
        {
          habit_id: habitId,
          user_id: currentUserId,
          completed_date: today,
        },
      ])
      .select();

    if (error) {
      if (error.code === "23505") {
        alert("You've already completed this habit today!");
      } else {
        console.error("Error logging habit:", error);
        alert("Failed to log habit completion");
      }
      return;
    }

    // Update local state for instant feedback
    setHabitLogs((current) => [...current, data[0]]);

    // Refetch habits to get updated streak
    // (Trigger already updated it in database)
    await fetchHabits();
  };

  /**
   * Unmark habit
   * Database trigger automatically decreases streak!
   */
  const handleUnmarkComplete = async (habitId: string) => {
    if (!currentUserId) return;

    const today = new Date().toISOString().split("T")[0];

    // Delete log - trigger will decrease streak automatically!
    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("habit_id", habitId)
      .eq("user_id", currentUserId)
      .eq("completed_date", today);

    if (error) {
      console.error("Error removing log:", error);
      return;
    }

    // Update local state for instant feedback
    setHabitLogs((current) =>
      current.filter((log) => log.habit_id !== habitId)
    );

    // Refetch habits to get updated streak
    await fetchHabits();
  };

  /**
   * Create new habit
   * Starts with streak = 0, last_completed = null
   */
  const handleCreate = async (formData: {
    title: string;
    description: string;
    frequency: string;
  }) => {
    if (!currentUserId) {
      alert("You must be logged in to create a habit");
      return;
    }

    const { data, error } = await supabase
      .from("habits")
      .insert([
        {
          ...formData,
          user_id: currentUserId,
          current_streak: 0,
          last_completed: null,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating habit:", error);
      alert("Failed to create habit");
    } else {
      setHabits([data[0], ...habits]);
    }
  };

  /**
   * Update habit details
   * Streak data doesn't change
   */
  const handleUpdate = async (
    editingId: string,
    formData: {
      title: string;
      description: string;
      frequency: string;
    }
  ) => {
    const { data, error } = await supabase
      .from("habits")
      .update(formData)
      .eq("id", editingId)
      .select();

    if (error) {
      console.error("Error updating habit:", error);
      alert("Failed to update habit");
    } else {
      setHabits((current) =>
        current.map((h) => (h.id === editingId ? data[0] : h))
      );
    }
  };

  /**
   * Delete habit
   * CASCADE removes logs automatically
   */
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure? This will delete the habit and all completion logs."
      )
    )
      return;

    const { error } = await supabase.from("habits").delete().eq("id", id);

    if (error) {
      console.error("Error deleting habit:", error);
      alert("Failed to delete habit");
    } else {
      setHabits((current) => current.filter((h) => h.id !== id));
      setHabitLogs((current) => current.filter((log) => log.habit_id !== id));
    }
  };

  // ==========================================================================
  // RETURN API
  // ==========================================================================

  return {
    habits, // Habits with streaks already calculated!
    loading,
    isCompletedToday,
    handleMarkComplete, // Streak updates automatically via trigger
    handleUnmarkComplete, // Streak updates automatically via trigger
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}

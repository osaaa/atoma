import { useCallback, useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Habit represents a single habit in the database
type Habit = {
  id: string; // Unique identifier (UUID)
  title: string; // Habit name (e.g., "Morning Run")
  description: string | null; // Optional details about the habit
  frequency: string; // How often: "daily", "weekly", or "monthly"
  created_at: string; // When habit was created (timestamp)
  user_id: string; // Who owns this habit (UUID)
  streak?: number; // Current streak in days (calculated, not stored in DB)
};

// HabitLog represents a single completion entry
type HabitLog = {
  id: string; // Unique identifier for the log
  habit_id: string; // Which habit was completed
  user_id: string; // Who completed it
  completed_date: string; // Date it was completed (format: "YYYY-MM-DD")
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useHabits(currentUserId: string | null) {
  // STATE: Store all habits for the current user
  const [habits, setHabits] = useState<Habit[]>([]);

  // STATE: Store today's completion logs
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);

  // STATE: Store ALL logs (for streak calculation) - cached in memory
  const [allLogs, setAllLogs] = useState<HabitLog[]>([]);

  // STATE: Track loading state (true while fetching from database)
  const [loading, setLoading] = useState(true);

  // ==========================================================================
  // FETCH FUNCTIONS
  // ==========================================================================

  /**
   * Fetch ALL logs for this user to calculate streaks
   * This gets the entire history, not just today
   * We store this in state so we don't need to re-fetch it constantly
   */
  const fetchAllLogs = useCallback(async () => {
    if (!currentUserId) return [];

    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", currentUserId)
      .order("completed_date", { ascending: false }); // Newest first

    if (error) {
      console.error("Error fetching all logs:", error);
      return [];
    }

    const logs = data || [];
    setAllLogs(logs); // Cache in state
    return logs;
  }, [currentUserId]);

  /**
   * Fetch only TODAY'S logs
   * Used to check if habits are completed today (for checkmarks)
   */
  const fetchTodaysLogs = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0]; // Format: "YYYY-MM-DD"

    if (!currentUserId) return;

    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", currentUserId)
      .eq("completed_date", today); // Only get logs for TODAY

    if (error) {
      console.error("Error fetching today's logs:", error);
    } else {
      setHabitLogs(data || []); // Store in state
    }
  }, [currentUserId]);

  /**
   * Calculate streak for a specific habit
   * Counts consecutive days from today backwards
   *
   * Example:
   * - Completed: Dec 2, Dec 1, Nov 30, Nov 29
   * - Today is Dec 2
   * - Streak = 4 days
   *
   * If you miss Nov 28, streak stops at 4 (doesn't count earlier days)
   */
  const calculateStreak = useCallback(
    (habitId: string, logs: HabitLog[]): number => {
      // Filter logs for this specific habit
      const habitLogs = logs
        .filter((log) => log.habit_id === habitId)
        .map((log) => log.completed_date) // Extract just the dates
        .sort() // Sort oldest to newest
        .reverse(); // Reverse to newest first

      // If no logs, streak is 0
      if (habitLogs.length === 0) return 0;

      let streak = 0; // Counter for consecutive days
      const checkDate = new Date(); // Start from today
      checkDate.setHours(0, 0, 0, 0); // Reset to midnight (ignore time)

      // Loop through logs and count consecutive days
      for (let i = 0; i < habitLogs.length; i++) {
        // Convert log date string to Date object
        const logDate = new Date(habitLogs[i] + "T00:00:00");

        // Calculate how many days ago this log was
        // If streak = 0, we're checking today (0 days ago)
        // If streak = 1, we're checking yesterday (1 day ago)
        const daysDiff = Math.floor(
          (checkDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // If this log is for the expected date (streak days ago)
        if (daysDiff === streak) {
          streak++; // Increment streak and check next day
        } else {
          // Found a gap! Streak is broken, stop counting
          break;
        }
      }

      return streak;
    },
    []
  );

  /**
   * Fetch all habits for this user AND calculate their streaks
   * This is the main function that combines habits with their streak data
   */
  const fetchHabitsAndCalculateStreaks = useCallback(async () => {
    setLoading(true); // Show loading indicator

    // Make sure user is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch habits from database
    const { data: habitsData, error: habitsError } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }); // Newest first

    if (habitsError) {
      console.error("Error fetching habits:", habitsError);
      setLoading(false);
      return;
    }

    // Fetch ALL logs to calculate streaks (also caches in state)
    const logs = await fetchAllLogs();

    // Add streak to each habit
    const habitsWithStreaks = (habitsData || []).map((habit) => ({
      ...habit, // Keep all existing habit data
      streak: calculateStreak(habit.id, logs), // Add calculated streak
    }));

    setHabits(habitsWithStreaks); // Store in state
    setLoading(false); // Hide loading indicator
  }, [fetchAllLogs, calculateStreak]);

  /**
   * Recalculate streaks WITHOUT re-fetching from database
   * Uses cached allLogs data for instant updates
   * This prevents the flickering/reload effect
   */
  const recalculateStreaks = useCallback(
    (updatedLogs: HabitLog[]) => {
      setHabits((currentHabits) =>
        currentHabits.map((habit) => ({
          ...habit,
          streak: calculateStreak(habit.id, updatedLogs),
        }))
      );
    },
    [calculateStreak]
  );

  // ==========================================================================
  // RUN ON COMPONENT MOUNT / USER CHANGE
  // ==========================================================================

  useEffect(() => {
    if (currentUserId) {
      fetchHabitsAndCalculateStreaks(); // Get habits with streaks
      fetchTodaysLogs(); // Get today's completions
    }
  }, [currentUserId, fetchHabitsAndCalculateStreaks, fetchTodaysLogs]);

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  /**
   * Check if a specific habit is completed TODAY
   * Returns true if there's a log entry for this habit in today's logs
   */
  const isCompletedToday = (habitId: string): boolean => {
    return habitLogs.some((log) => log.habit_id === habitId);
  };

  // ==========================================================================
  // CRUD OPERATIONS - OPTIMIZED FOR INSTANT UI UPDATES
  // ==========================================================================

  /**
   * CREATE: Mark a habit as complete for today
   * Inserts a new log entry in the database
   * OPTIMIZED: Updates local state immediately, no full refetch
   */
  const handleMarkComplete = async (habitId: string) => {
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Insert new completion log
    const { data, error } = await supabase
      .from("habit_logs")
      .insert([
        {
          habit_id: habitId,
          user_id: currentUserId,
          completed_date: today,
        },
      ])
      .select(); // Return the inserted row

    if (error) {
      // Error code 23505 = unique constraint violation
      // This means the habit was already completed today
      if (error.code === "23505") {
        alert("You've already completed this habit today!");
      } else {
        console.error("Error logging habit:", error);
        alert("Failed to log habit completion");
      }
    } else {
      // ✨ INSTANT UPDATE - No database refetch!
      const newLog = data[0];

      // Update today's logs (for checkmarks)
      setHabitLogs((current) => [...current, newLog]);

      // Update all logs cache (for streak calculation)
      const updatedAllLogs = [newLog, ...allLogs];
      setAllLogs(updatedAllLogs);

      // Recalculate streaks instantly using cached data
      recalculateStreaks(updatedAllLogs);
    }
  };

  /**
   * DELETE: Remove today's completion (undo)
   * Deletes the log entry for today
   * OPTIMIZED: Updates local state immediately, no full refetch
   */
  const handleUnmarkComplete = async (habitId: string) => {
    const today = new Date().toISOString().split("T")[0];

    // Delete the log for this habit + user + today
    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("habit_id", habitId)
      .eq("user_id", currentUserId)
      .eq("completed_date", today);

    if (error) {
      console.error("Error removing log:", error);
    } else {
      // ✨ INSTANT UPDATE - No database refetch!

      // Remove from today's logs (for checkmarks)
      setHabitLogs((current) =>
        current.filter((log) => log.habit_id !== habitId)
      );

      // Remove from all logs cache (for streak calculation)
      const updatedAllLogs = allLogs.filter(
        (log) => !(log.habit_id === habitId && log.completed_date === today)
      );
      setAllLogs(updatedAllLogs);

      // Recalculate streaks instantly using cached data
      recalculateStreaks(updatedAllLogs);
    }
  };

  /**
   * CREATE: Add a new habit
   * Inserts a new habit in the database
   */
  const handleCreate = async (formData: {
    title: string;
    description: string;
    frequency: string;
  }) => {
    // Make sure user is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to create a habit");
      return;
    }

    // Insert new habit with user_id
    const { data, error } = await supabase
      .from("habits")
      .insert([{ ...formData, user_id: user.id }])
      .select(); // Return the created habit

    if (error) {
      console.error("Error creating habit:", error);
      alert("Failed to create habit");
    } else {
      // Add new habit to the top of the list with streak = 0
      const newHabit = { ...data[0], streak: 0 };
      setHabits([newHabit, ...habits]);
    }
  };

  /**
   * UPDATE: Edit an existing habit
   * Updates habit title, description, or frequency
   */
  const handleUpdate = async (
    editingId: string,
    formData: {
      title: string;
      description: string;
      frequency: string;
    }
  ) => {
    // Update the habit in database
    const { data, error } = await supabase
      .from("habits")
      .update(formData)
      .eq("id", editingId)
      .select(); // Return updated habit

    if (error) {
      console.error("Error updating habit:", error);
      alert("Failed to update habit");
    } else {
      // Replace old habit with updated one in state
      // Keep the existing streak (it doesn't change when editing details)
      setHabits((current) =>
        current.map((h) =>
          h.id === editingId ? { ...data[0], streak: h.streak } : h
        )
      );
    }
  };

  /**
   * DELETE: Remove a habit (and all its logs)
   * Thanks to ON DELETE CASCADE, logs are automatically deleted too
   */
  const handleDelete = async (id: string) => {
    // Confirm before deleting (prevent accidents)
    if (
      !confirm(
        "Are you sure? This will delete the habit and all completion logs."
      )
    )
      return;

    // Delete the habit
    const { error } = await supabase.from("habits").delete().eq("id", id);

    if (error) {
      console.error("Error deleting habit:", error);
      alert("Failed to delete habit");
    } else {
      // Remove from state
      setHabits((current) => current.filter((h) => h.id !== id));

      // Also remove its logs from cache
      setHabitLogs((current) => current.filter((log) => log.habit_id !== id));
      setAllLogs((current) => current.filter((log) => log.habit_id !== id));
    }
  };

  // ==========================================================================
  // RETURN (What this hook provides to components)
  // ==========================================================================

  return {
    habits, // Array of habits with streaks
    loading, // True while fetching data
    isCompletedToday, // Function: Check if habit completed today
    handleMarkComplete, // Function: Mark habit as complete (OPTIMIZED)
    handleUnmarkComplete, // Function: Undo completion (OPTIMIZED)
    handleCreate, // Function: Create new habit
    handleUpdate, // Function: Edit existing habit
    handleDelete, // Function: Delete habit
  };
}

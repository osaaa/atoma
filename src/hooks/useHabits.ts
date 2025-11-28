import { useCallback, useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

type Habit = {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  created_at: string;
};

type HabitLogs = {
  id: string;
  habit_id: string;
  completed_date: string;
};

export function useHabits(currentUserId: string | null) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLogs[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodaysLogs = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];

    if (!currentUserId) return;

    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", currentUserId)
      .eq("completed_date", today);

    if (error) {
      console.error("Error fetching logs:", error);
    } else {
      setHabitLogs(data || []);
    }
  }, [currentUserId]);

  const fetchHabits = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Error fetching Habits: ", error);
    } else {
      setHabits(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchHabits();
      fetchTodaysLogs();
    }
  }, [currentUserId, fetchHabits, fetchTodaysLogs]);

  const isCompletedToday = (habitId: string): boolean => {
    return habitLogs.some((log) => log.habit_id === habitId);
  };

  const handleMarkComplete = async (habitId: string) => {
    const today = new Date().toISOString().split("T")[0];

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
    } else {
      setHabitLogs([...habitLogs, data[0]]);
    }
  };

  const handleUnmarkComplete = async (habitId: string) => {
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("habit_id", habitId)
      .eq("user_id", currentUserId)
      .eq("completed_date", today);

    if (error) {
      console.error("Error removing log:", error);
    } else {
      setHabitLogs(habitLogs.filter((log) => log.habit_id !== habitId));
    }
  };

  const handleCreate = async (formData: {
    title: string;
    description: string;
    frequency: string;
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to create a habit");
      return;
    }

    const { data, error } = await supabase
      .from("habits")
      .insert([{ ...formData, user_id: user.id }])
      .select();

    if (error) {
      console.error("Error creating habit:", error);
      alert("Failed to create habit");
    } else {
      setHabits([data[0], ...habits]);
    }
  };

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
      setHabits(habits.map((h) => (h.id === editingId ? data[0] : h)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this habit?")) return;

    const { error } = await supabase.from("habits").delete().eq("id", id);

    if (error) {
      console.error("Error deleting habit:", error);
      alert("Failed to delete habit");
    } else {
      setHabits(habits.filter((h) => h.id !== id));
    }
  };

  return {
    habits,
    loading,
    isCompletedToday,
    handleMarkComplete,
    handleUnmarkComplete,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}

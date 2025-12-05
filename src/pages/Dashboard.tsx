import HomeButton from "../components/HomeButton";
import LogOut from "../components/LogOut";
import HabitCard from "../components/HabitCard";
import HabitForm from "../components/HabitForm";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useHabits } from "../hooks/useHabits";

type Habit = {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  created_at: string;
  user_id: string;
  current_streak: number;
  last_completed: string | null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | undefined | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showOtherHabits, setShowOtherHabits] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    frequency: "daily",
  });

  const {
    habits,
    loading,
    isCompletedToday,
    handleMarkComplete,
    handleUnmarkComplete,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useHabits(currentUserId);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUsername(user.user_metadata?.username);
        setCurrentUserId(user.id);
      } else {
        //no user logged in, redirect to sign in
        navigate("/signin");
      }
    };
    getUser();
  }, [navigate]); // Runs once when page loads. [navigate] tells React to re-run if navigate
  // changes (which it won't, but keeps linter happy)

  const handleEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setFormData({
      title: habit.title,
      description: habit.description || "",
      frequency: habit.frequency,
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: {
    title: string;
    description: string;
    frequency: string;
  }) => {
    if (editingId) {
      await handleUpdate(editingId, formData);
    } else {
      await handleCreate(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      frequency: "daily",
    });
    setShowForm(false);
  };

  // Helper function to check if habit is due today based on frequency
  const isHabitDueToday = (habit: Habit): boolean => {
    const today = new Date();
    const dayOfTheWeek = today.getDay(); //0=SUNDAY,6=SATURDAY
    const dayOfTheMonth = today.getDate();
    const lastDayofTheMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();

    switch (habit.frequency.toLowerCase()) {
      case "daily":
        return true;
      case "weekly":
        return dayOfTheWeek === 0;
      case "monthly":
        return dayOfTheMonth === lastDayofTheMonth;
      default:
        return true;
    }
  };

  // Format current date
  const formatDate = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const now = new Date();
    return `${days[now.getDay()]}, ${
      months[now.getMonth()]
    } ${now.getDate()}, ${now.getFullYear()}`;
  };

  // Filter habits by whether they're due today
  const todaysHabits = habits.filter((h) => isHabitDueToday(h));
  const otherHabits = habits.filter((h) => !isHabitDueToday(h));

  // Calculate progress stats
  const completedToday = todaysHabits.filter((h) =>
    isCompletedToday(h.id)
  ).length;
  const totalToday = todaysHabits.length;
  const progressPercent =
    totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  // Find best streak
  const bestStreak =
    habits.length > 0 ? Math.max(...habits.map((h) => h.current_streak)) : 0;
  const bestStreakHabit = habits.find((h) => h.current_streak === bestStreak);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="p-2 flex justify-between items-center bg-slate-200/20 rounded-xl">
          <div className=""></div>
          <HomeButton />
          <LogOut />
        </div>

        {/* Welcome & Progress Summary */}
        <div className="my-8 p-6 bg-slate-300/50 rounded-xl shadow-xl/20">
          <h2 className="text-2xl mb-4">
            👋 Welcome back, {username || "there"}!
          </h2>

          <div
            className={`p-4 rounded-lg transition-colors ${
              progressPercent >= 80
                ? "bg-linear-to-t from-emerald-500/60 to-green-400/50 shadow-xl/20"
                : progressPercent >= 50
                ? "bg-fuchsia-700/20"
                : "bg-violet-500/50"
            }`}
          >
            <p className="text-sm text-gray-600 mb-2">📅 {formatDate()}</p>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm mt-2">
                {completedToday} of {totalToday} habits completed today
              </p>
            </div>

            {/* Best Streak */}
            {bestStreak > 0 && (
              <p className="text-sm">
                🔥 Longest streak:{" "}
                <span className="font-bold">{bestStreak} days</span>
                {bestStreakHabit && ` (${bestStreakHabit.title})`}
              </p>
            )}
          </div>
        </div>

        {/* Today's Habits Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-indigo-700">
              Today's Habits
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              {showForm ? "Cancel" : "+ Add Habit"}
            </button>
          </div>

          {/* Create/Edit Form */}
          {showForm && (
            <div className="mb-6">
              <HabitForm
                editingId={editingId}
                initialData={formData}
                onSubmit={handleFormSubmit}
                onCancel={resetForm}
              />
            </div>
          )}

          {/* Habits List */}
          {loading ? (
            <p className="text-gray-400">Loading your atoma habits...</p>
          ) : todaysHabits.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 rounded-lg">
              <p className="text-4xl mb-4">📝</p>
              <p className="text-xl mb-2">No habits due today</p>
              <p className="text-gray-400">
                Create your first habit to get started!
              </p>
            </div>
          ) : completedToday === totalToday && totalToday > 0 ? (
            <div className="text-center py-12 bg-linear-to-t from-emerald-500/60 to-green-400/50  border-2 border-green-500 rounded-xl shadow-xl/20">
              <p className="text-4xl mb-4">🎉</p>
              <p className="text-xl font-bold mb-2">All done for today!</p>
              <p className="text-gray-700">
                Great work! Come back tomorrow to keep your streaks going.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaysHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={isCompletedToday(habit.id)}
                  onMarkComplete={handleMarkComplete}
                  onUnmarkComplete={handleUnmarkComplete}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Other Habits Section (Collapsible) */}
        {otherHabits.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowOtherHabits(!showOtherHabits)}
              className="w-full p-4 bg-slate-800 rounded-lg text-left flex justify-between items-center hover:bg-slate-750 transition shadow-xl/20"
            >
              <span className="font-bold text-indigo-400">
                {showOtherHabits ? "▼" : "▶"} Other Habits (Not due today)
              </span>
              <span className="text-gray-400 text-sm">
                {otherHabits.length} habit{otherHabits.length !== 1 ? "s" : ""}
              </span>
            </button>

            {showOtherHabits && (
              <div className="mt-4 space-y-4">
                {otherHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="opacity-60 hover:opacity-100 transition"
                  >
                    <HabitCard
                      habit={habit}
                      isCompleted={isCompletedToday(habit.id)}
                      onMarkComplete={handleMarkComplete}
                      onUnmarkComplete={handleUnmarkComplete}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

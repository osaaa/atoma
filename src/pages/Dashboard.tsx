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
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | undefined | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="p-2 flex justify-between items-center bg-slate-200/20 rounded-xl">
          <div className=""></div>
          <HomeButton />
          <LogOut />
        </div>

        <div className="mt-4 border bg-slate-200/20 rounded-xl border-transparent p-2 flex flex-row justify-between items-center text-center">
          <span className="text-2xl font-bold text-indigo-500">Dashboard</span>
          <span className="">
            {username && (
              <p className="text-indigo-500">Welcome, {username}!</p>
            )}
          </span>
        </div>

        {/* Header with Add Button */}
        <div className="flex justify-between items-center my-8">
          <h1 className="text-2xl border rounded-xl bg-slate-300/30 border-transparent p-2 text-indigo-500 font-bold">
            my atoma habits
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {showForm ? "Cancel" : "➕ Add Habit"}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <HabitForm
            editingId={editingId}
            initialData={formData}
            onSubmit={handleFormSubmit}
            onCancel={resetForm}
          />
        )}
        {/* Habits List */}
        <div>
          {loading ? (
            <p>loading your atoma habits...</p>
          ) : habits.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No habits yet. Create your first one!
            </p>
          ) : (
            <div className="grid gap-4">
              {habits.map((habit) => (
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
      </div>
    </div>
  );
}

import HomeButton from "../components/HomeButton";
import LogOut from "../components/LogOut";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  type Habit = {
    id: string;
    title: string;
    description: string | null;
    frequency: string;
    created_at: string;
  };

  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]); //array of habits
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | undefined | null>(null);
  //get current user when page loads

  //form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    frequency: "daily",
  });

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUsername(user.user_metadata?.username);
      } else {
        //no user logged in, redirect to sign in
        navigate("/signin");
      }
    };
    getUser();
  }, [navigate]); // Runs once when page loads. [navigate] tells React to re-run if navigate
  // changes (which it won't, but keeps linter happy)

  const fetchHabits = async () => {
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
      setHabits(data || []); //store in state
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  //CREATE: add new habit
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

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
      setHabits([data[0], ...habits]); // Add to top of list
      resetForm();
    }
  };

  //UPDATE: edit existing habit
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId) return;

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
      resetForm();
    }
  };

  //DELETE: Remove habit
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

  //Edit a habit
  const handleEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setFormData({
      title: habit.title,
      description: habit.description || "",
      frequency: habit.frequency,
    });
    setShowForm(true);
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
          <div className="mb-6 p-6 bg-slate-300/30 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-indigo-500">
              {editingId ? "Edit Habit" : "Create New Habit"}
            </h2>
            <form
              onSubmit={editingId ? handleUpdate : handleCreate}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Frequency *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600"
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
                <div key={habit.id} className="p-4 bg-slate-300/30 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{habit.title}</h3>
                      <p className="text-gray-400 mt-1">{habit.description}</p>
                      <span className="inline-block mt-2 text-sm px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                        {habit.frequency}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(habit)}
                        className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        title="Edit"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        title="Delete"
                      >
                        delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

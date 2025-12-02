import { useState } from "react";

type HabitFormProps = {
  editingId: string | null;
  initialData: {
    title: string;
    description: string;
    frequency: string;
  };
  onSubmit: (formData: {
    title: string;
    description: string;
    frequency: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export default function HabitForm({
  editingId,
  initialData,
  onSubmit,
  onCancel,
}: HabitFormProps) {
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="mb-6 p-6 bg-slate-300/30 rounded-xl shadow-xl/20">
      <h2 className="text-xl font-bold mb-4 text-indigo-500">
        {editingId ? "Edit Habit" : "Create New Habit"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-2 bg-slate-700/30 rounded border border-slate-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2 bg-slate-700/30 rounded border border-slate-600"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Frequency *</label>
          <select
            value={formData.frequency}
            onChange={(e) =>
              setFormData({ ...formData, frequency: e.target.value })
            }
            className="w-full p-2 bg-slate-700/30 rounded border border-slate-600"
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
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

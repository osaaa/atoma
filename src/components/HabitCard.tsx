type Habit = {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  created_at: string;
};

type HabitCardProps = {
  habit: Habit;
  isCompleted: boolean;
  onMarkComplete: (id: string) => void;
  onUnmarkComplete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
};

export default function HabitCard({
  habit,
  isCompleted,
  onMarkComplete,
  onUnmarkComplete,
  onEdit,
  onDelete,
}: HabitCardProps) {
  return (
    <div
      className={`p-4 rounded-lg transition-colors ${
        isCompleted
          ? "bg-green-500/20 border-2 border-green-500"
          : "bg-slate-300/30"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold">{habit.title}</h3>
            {isCompleted && <span className="text-2xl">✅</span>}
          </div>
          <p className="text-gray-400 mt-1">{habit.description}</p>
          <span className="inline-block mt-2 text-sm px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
            {habit.frequency}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-4">
          {/* Mark Complete / Completed Button */}
          {isCompleted ? (
            <button
              onClick={() => onUnmarkComplete(habit.id)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              title="Click to undo"
            >
              ✓ Completed
            </button>
          ) : (
            <button
              onClick={() => onMarkComplete(habit.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Mark as complete"
            >
              Mark Complete
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(habit)}
              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(habit.id)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Habit - Represents a single habit
 * This matches the structure from the database
 */
type Habit = {
  id: string; // Unique identifier (UUID)
  title: string; // Habit name (e.g., "Morning Run")
  description: string | null; // Optional details about the habit
  frequency: string; // How often: "daily", "weekly", or "monthly"
  created_at: string; // When habit was created (timestamp)
  streak?: number; // ADDED: Current streak in days (optional)
};

/**
 * HabitCardProps - Props that this component receives from its parent
 * These are the "inputs" to the component
 */
type HabitCardProps = {
  habit: Habit; // The habit data to display
  isCompleted: boolean; // Is this habit completed TODAY?
  onMarkComplete: (id: string) => void; // Function to call when marking complete
  onUnmarkComplete: (id: string) => void; // Function to call when undoing completion
  onEdit: (habit: Habit) => void; // Function to call when editing
  onDelete: (id: string) => void; // Function to call when deleting
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function HabitCard({
  habit,
  isCompleted,
  onMarkComplete,
  onUnmarkComplete,
  onEdit,
  onDelete,
}: HabitCardProps) {
  // STATE: Track whether the overflow menu (⋮) is open
  const [showMenu, setShowMenu] = useState(false);

  /**
   * Toggle completion status
   * If completed → undo it
   * If not completed → mark as complete
   */
  const handleToggleComplete = () => {
    if (isCompleted) {
      onUnmarkComplete(habit.id); // Undo completion
    } else {
      onMarkComplete(habit.id); // Mark as complete
    }
  };

  return (
    // ==========================================================================
    // CARD CONTAINER
    // ==========================================================================
    // The outer div is the card itself
    // Dynamic styling based on completion status:
    // - If completed: Green background + green border (celebration!)
    // - If not completed: Gray background (neutral state)
    <div
      className={`p-4 rounded-xl transition-all shadow-xl/10 ${
        isCompleted
          ? "bg-linear-65 from-emerald-500/60 to-green-400/50 border-2 border-green-500" // ✅ Completed styling
          : "bg-fuchsia-400/40 hover:bg-slate-750 " // ☐ Incomplete styling
      }`}
    >
      {/* Main content wrapper - flexbox for left/right layout */}
      <div className="flex items-start justify-between">
        {/* ====================================================================
            LEFT SIDE: Habit info (clickable to toggle completion)
            ==================================================================== */}
        <div
          className="flex-1 cursor-pointer" // flex-1 = take up all available space
          onClick={handleToggleComplete} // Click anywhere to toggle
        >
          {/* TITLE ROW: Checkbox + Title */}
          <div className="flex items-center gap-3 mb-2">
            {/* Checkbox Icon */}
            {/* Shows ✅ when completed, ☐ when not */}
            <span className="text-2xl">{isCompleted ? "✅" : "☐"}</span>

            {/* Habit Title */}
            <h3 className="text-xl font-bold">{habit.title}</h3>
          </div>

          {/* DESCRIPTION (only shown if it exists) */}
          {/* The && operator means "if description exists, show this paragraph" */}
          {habit.description && (
            <p className="text-gray-400 text-sm ml-11 mb-2">
              {/* ml-11 aligns with title (moves it right to match the indent) */}
              {habit.description}
            </p>
          )}

          {/* BADGES ROW: Frequency + Streak */}
          <div className="flex items-center gap-3 ml-11">
            {/* Frequency Badge (always shown) */}
            {/* Pill-shaped badge with blue tint */}
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
              {habit.frequency}
            </span>

            {/* Streak Indicator (conditional) */}
            {/* If streak exists AND is greater than 0, show fire emoji + count */}
            {/* If no streak or streak is 0, show motivational message */}
            {habit.streak !== undefined && habit.streak > 0 ? (
              <span className="text-sm font-medium">
                🔥 {habit.streak} day{habit.streak !== 1 ? "s" : ""} streak
                {/* Pluralization: "1 day" vs "2 days" */}
              </span>
            ) : (
              <span className="text-sm text-gray-500">Start streak!</span>
            )}
          </div>
        </div>

        {/* ====================================================================
            RIGHT SIDE: Action buttons (⋮ menu)
            ==================================================================== */}
        <div className="relative ml-4">
          {/* THREE-DOT MENU BUTTON (⋮) */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // IMPORTANT: Prevent clicking card underneath
              setShowMenu(!showMenu); // Toggle menu open/closed
            }}
            className="p-2 hover:bg-slate-700 rounded transition"
            aria-label="More options" // Accessibility: Screen readers announce this
          >
            ⋮
          </button>

          {/* DROPDOWN MENU (only visible when showMenu is true) */}
          {showMenu && (
            <>
              {/* ==============================================================
                  BACKDROP - Invisible layer that closes menu when clicked
                  ============================================================== */}
              {/* This covers the entire screen behind the menu */}
              {/* When you click anywhere outside the menu, it closes */}
              <div
                className="fixed inset-0 z-10" // inset-0 = covers whole screen
                onClick={() => setShowMenu(false)} // Close menu on click
              />

              {/* ==============================================================
                  MENU ITEMS
                  ============================================================== */}
              {/* Positioned absolutely relative to the ⋮ button */}
              {/* z-20 puts it above the backdrop (z-10) */}
              <div className="absolute right-0 mt-1 bg-slate-700 rounded shadow-lg z-20 min-w-[120px]">
                {/* EDIT BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Don't trigger card click
                    onEdit(habit); // Call the edit function from props
                    setShowMenu(false); // Close menu after clicking
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-600 flex items-center gap-2 transition"
                >
                  ✏️ Edit
                </button>

                {/* DELETE BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Don't trigger card click
                    onDelete(habit.id); // Call the delete function from props
                    setShowMenu(false); // Close menu after clicking
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-600 flex items-center gap-2 text-red-400 transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HOW THIS COMPONENT WORKS
// ============================================================================

/**
 * DATA FLOW:
 *
 * 1. Parent (Dashboard) passes props:
 *    - habit: The habit object from database
 *    - isCompleted: true/false based on today's logs
 *    - onMarkComplete, onUnmarkComplete, onEdit, onDelete: Functions
 *
 * 2. User clicks on card:
 *    - handleToggleComplete() runs
 *    - Calls onMarkComplete() or onUnmarkComplete() (goes back to parent)
 *    - Parent updates database
 *    - Parent re-renders this component with new isCompleted value
 *    - Card appearance updates (green border, checkmark, etc.)
 *
 * 3. User clicks ⋮ button:
 *    - setShowMenu(true) → Menu appears
 *    - User clicks Edit or Delete
 *    - Calls onEdit() or onDelete() (goes back to parent)
 *    - Parent handles the action
 *
 * 4. User clicks outside menu:
 *    - Backdrop's onClick fires
 *    - setShowMenu(false) → Menu disappears
 */

/**
 * STYLING BREAKDOWN:
 *
 * - Completed state:
 *   - Green background: bg-green-500/10 (green with 10% opacity)
 *   - Green border: border-2 border-green-500
 *   - Checkmark: ✅
 *
 * - Incomplete state:
 *   - Gray background: bg-slate-800
 *   - No border
 *   - Empty checkbox: ☐
 *
 * - Hover effects:
 *   - Card: hover:bg-slate-750 (slightly lighter on hover)
 *   - Buttons: Background darkens on hover
 *
 * - transition-all: Smooth animation when switching between states
 */

/**
 * KEY PATTERNS USED:
 *
 * 1. CONDITIONAL RENDERING:
 *    {condition && <Component />}
 *    Only renders if condition is true
 *
 * 2. TERNARY OPERATOR:
 *    {condition ? <TrueComponent /> : <FalseComponent />}
 *    Renders one thing or another based on condition
 *
 * 3. EVENT PROPAGATION:
 *    e.stopPropagation()
 *    Prevents click events from bubbling up to parent elements
 *
 * 4. TEMPLATE LITERALS:
 *    className={`fixed ${isOpen ? 'visible' : 'hidden'}`}
 *    Dynamically construct strings with JavaScript values
 *
 * 5. OPTIONAL CHAINING:
 *    habit.streak?.toString()
 *    Safely access properties that might not exist
 */

# Learning Guide: Building Streak Tracking & Dashboard Redesign

## 🎯 Learning Objectives

By the end of this guide, you'll understand:

- How to calculate streaks from database records
- How to filter data based on dates and frequency
- How to structure React components for complex UIs
- How to manage derived state (calculations from data)
- How to create responsive, user-friendly interfaces

---

## 📚 Phase 1: Understanding Streak Calculation

### What is a Streak?

A streak is the number of consecutive days a habit has been completed without missing a day.

**Example:**

```
Nov 24: ✅ Completed
Nov 25: ✅ Completed
Nov 26: ❌ Missed
Nov 27: ✅ Completed
Nov 28: ✅ Completed (today)

Streak = 2 days (Nov 27 & 28)
```

### Challenge 1: Pseudocode the Logic

Before coding, write out the logic in plain English:

```
1. Get all completion logs for this habit, sorted by date (newest first)
2. Start from today and count backwards
3. For each day:
   - If there's a log for that day, increment streak counter
   - If there's no log, stop counting (streak is broken)
4. Return the streak count
```

**Your Task:**

- Open a text file and write your own pseudocode
- Think about edge cases:
  - What if the habit was created today?
  - What if today hasn't been completed yet?
  - What about weekly/monthly habits?

---

## 📚 Phase 2: Database Query for Streaks

### Understanding the Data Structure

Your `habit_logs` table looks like:

```
| id   | habit_id | user_id | completed_date | created_at |
|------|----------|---------|----------------|------------|
| 1    | abc-123  | user-1  | 2025-11-28     | ...        |
| 2    | abc-123  | user-1  | 2025-11-27     | ...        |
| 3    | abc-123  | user-1  | 2025-11-25     | ...        |
```

### Challenge 2: Write the Query

You need to fetch logs for a specific habit, ordered by date.

**Hint:** In Supabase:

```javascript
const { data } = await supabase
  .from("habit_logs")
  .select("completed_date")
  .eq("habit_id", habitId)
  .order("completed_date", { ascending: false });
```

**Your Task:**

1. Open `src/hooks/useHabits.ts`
2. Create a new function called `calculateStreak`
3. Think about what parameters it needs (habit_id? user_id? the logs themselves?)
4. Don't code it yet - just plan it out

**Questions to Consider:**

- Should you fetch logs inside this function, or pass them in?
- Where should this function live? (in the hook? separate utility file?)
- How will you handle the date comparison?

---

## 📚 Phase 3: Implementing Streak Calculation

### JavaScript Date Handling

Key concepts you'll need:

```javascript
// Get today's date (YYYY-MM-DD format)
const today = new Date().toISOString().split("T")[0];
// Result: "2025-11-28"

// Get yesterday
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split("T")[0];
// Result: "2025-11-27"

// Compare dates
const date1 = "2025-11-28";
const date2 = "2025-11-27";
const diff = (new Date(date1) - new Date(date2)) / (1000 * 60 * 60 * 24);
// Result: 1 (one day difference)
```

### Challenge 3: Implement the Function

**Step-by-step approach:**

1. **Start simple** - Calculate streak for daily habits only
2. **Test with console.logs** - Print each step
3. **Handle edge cases** - Add checks for empty data
4. **Refine** - Clean up and optimize

**Starter Template:**

```javascript
function calculateStreak(completionLogs) {
  // TODO: Your implementation here

  // Step 1: Handle empty logs
  if (!completionLogs || completionLogs.length === 0) {
    return 0;
  }

  // Step 2: Get today's date
  const today = // ... your code

  // Step 3: Loop through logs and count consecutive days
  let streak = 0;
  // ... your code

  return streak;
}
```

**Your Task:**

1. Try implementing this yourself first
2. Test it with sample data:
   ```javascript
   const testLogs = [
     { completed_date: "2025-11-28" },
     { completed_date: "2025-11-27" },
     { completed_date: "2025-11-26" },
   ];
   console.log(calculateStreak(testLogs)); // Should return 3
   ```
3. Test edge cases:
   - Empty array
   - Only today completed
   - Gap in dates

**Debugging Tips:**

- Use `console.log()` liberally
- Check what each variable contains at each step
- Test with different date scenarios

---

## 📚 Phase 4: Integrating Streaks into useHabits Hook

### Understanding the Hook Structure

Your `useHabits` hook currently:

1. Fetches habits
2. Fetches today's logs
3. Provides CRUD functions

Now you need to: 4. Fetch ALL logs (not just today's) 5. Calculate streaks for each habit 6. Return streak data alongside habits

### Challenge 4: Modify the Hook

**Questions to think about:**

1. Should you fetch all logs at once, or per habit?

   - **Option A:** One query for all logs, then group by habit_id
   - **Option B:** Separate query for each habit's logs
   - Which is more efficient?

2. Where should streak calculation happen?

   - In the hook when data is fetched?
   - In the component when rendering?
   - As a separate computed value?

3. How should you structure the returned data?

   ```javascript
   // Option A: Add streak to habit object
   { id: '123', title: 'Run', streak: 5 }

   // Option B: Separate streaks object
   habits: [...], streaks: { '123': 5, '456': 3 }
   ```

**Your Task:**

1. Decide on your approach (write it down)
2. Sketch out the new hook structure
3. Identify what new state variables you need
4. Plan the data flow

**Don't code yet!** Planning is crucial.

---

## 📚 Phase 5: Filtering "Today's Habits"

### Understanding Frequency Logic

Different habits have different schedules:

**Daily Habits:**

- Due every day
- Always show in "Today's Habits"

**Weekly Habits:**

- Due on specific day(s) of the week
- For now, let's say they're due every Sunday
- Show only on Sundays

**Monthly Habits:**

- Due on specific day(s) of the month
- For now, let's say they're due on the 1st
- Show only on the 1st

### Challenge 5: Write the Filter Logic

**Pseudocode:**

```
function isDueToday(habit) {
  if habit.frequency === 'daily':
    return true

  if habit.frequency === 'weekly':
    // Check if today is the habit's scheduled day
    return today is Sunday

  if habit.frequency === 'monthly':
    // Check if today is the habit's scheduled day
    return today is the 1st
}
```

**JavaScript Date Helpers:**

```javascript
const today = new Date();
const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
const dayOfMonth = today.getDate(); // 1-31
```

**Your Task:**

1. Implement `isDueToday(habit)` function
2. Test it with different dates (change your system date or use test dates)
3. Think about future improvements:
   - What if users want to choose which day for weekly habits?
   - What if they want multiple days per week?
   - How would you store this in the database?

---

## 📚 Phase 6: Restructuring the Dashboard Component

### Component Architecture

Currently, your Dashboard does everything. Let's break it down:

```
Dashboard (Smart Component - handles data & logic)
├── Header (Presentational - just displays)
├── ProgressSummary (Smart - calculates stats)
│   └── ProgressBar (Presentational)
├── HabitsSection (Smart - filters & groups)
│   └── HabitCard (Presentational - displays one habit)
└── HabitForm (Smart - handles form state)
```

### Challenge 6: Plan the Refactor

**Step 1: Identify what stays in Dashboard**

- User authentication
- Data fetching (via useHabits hook)
- Form show/hide state
- Coordination between components

**Step 2: Identify what moves to new components**

- Progress calculation → ProgressSummary component
- Habit filtering → HabitsSection component
- Individual habit display → Already done (HabitCard)

**Your Task:**
Create a file called `REFACTOR_PLAN.md` and write:

1. List of new components you'll create
2. Props each component will receive
3. What state each component will manage
4. Order of implementation (which to build first)

**Example:**

```markdown
## ProgressSummary Component

### Props:

- habits: Habit[]
- completedToday: number
- totalDueToday: number

### Responsibilities:

- Display current date
- Show progress bar
- Calculate and show completion percentage
- Display best current streak

### State:

- None (all derived from props)
```

---

## 📚 Phase 7: Building ProgressSummary Component

### Learning: Derived State vs Stored State

**Stored State:** Data you fetch or user inputs

```javascript
const [habits, setHabits] = useState([]);
```

**Derived State:** Calculations from stored state

```javascript
// ❌ Don't do this:
const [completionRate, setCompletionRate] = useState(0);

// ✅ Do this instead:
const completionRate = (completedCount / totalCount) * 100;
```

**Why?** Derived state is always in sync with source data.

### Challenge 7: Build ProgressSummary

**Requirements:**

1. Display today's date in readable format
2. Show "X of Y habits completed"
3. Visual progress bar
4. Show longest current streak

**Your Task:**

**Step 1:** Create the file

```bash
touch src/components/ProgressSummary.tsx
```

**Step 2:** Define the component structure

```typescript
type ProgressSummaryProps = {
  // What props do you need?
};

export default function ProgressSummary(props: ProgressSummaryProps) {
  // What calculations do you need?

  return (
    // What JSX structure?
  );
}
```

**Step 3:** Implement piece by piece

- Start with just the date display
- Add the completion count
- Add the progress bar (use Tailwind width percentages)
- Add the streak display

**Hints:**

```javascript
// Format date nicely
const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
const formattedDate = new Date().toLocaleDateString("en-US", options);
// "Friday, November 28, 2025"

// Progress bar width
const progressPercent = (completed / total) * 100;
<div className="w-full bg-gray-200 rounded-full h-4">
  <div
    className="bg-green-500 h-4 rounded-full transition-all"
    style={{ width: `${progressPercent}%` }}
  />
</div>;
```

---

## 📚 Phase 8: Updating HabitCard with Streaks

### Challenge 8: Enhance HabitCard

Currently, HabitCard receives a habit object. Now it needs streak info too.

**Your Task:**

**Step 1:** Update the props

```typescript
type HabitCardProps = {
  habit: Habit;
  streak: number; // Add this
  isCompleted: boolean;
  onMarkComplete: (id: string) => void;
  onUnmarkComplete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
};
```

**Step 2:** Display the streak

- If streak > 0: Show "🔥 X day streak"
- If streak === 0: Show "Start your streak!"
- Position it prominently (top right of card)

**Step 3:** Style based on streak

- High streaks (7+): Gold/orange fire icon
- Medium streaks (3-6): Orange fire icon
- Low streaks (1-2): Red fire icon
- No streak: Gray text

**Bonus Challenge:**
Add a subtle animation when streak increases!

---

## 📚 Phase 9: Testing Your Implementation

### Manual Testing Checklist

Create test scenarios:

**Scenario 1: New Habit**

1. Create a new habit
2. Don't complete it
3. Expected: "Start your streak!" message

**Scenario 2: First Completion**

1. Mark the habit complete
2. Expected: "🔥 1 day streak"

**Scenario 3: Consecutive Days**

1. Manually add logs for yesterday and day before in database
2. Refresh page
3. Expected: "🔥 3 day streak"

**Scenario 4: Broken Streak**

1. Have logs for Nov 28, 27, 25 (missing 26)
2. Expected: "🔥 2 day streak" (only counts 27 & 28)

**Your Task:**

1. Create a testing checklist
2. Test each scenario
3. Document any bugs you find
4. Fix them one by one

---

## 📚 Phase 10: Optimization & Polish

### Performance Considerations

**Question:** When should streak calculation happen?

- On every render? (Slow)
- Only when data changes? (Better)
- Cached in database? (Best, but more complex)

**Learn about useMemo:**

```javascript
const streaks = useMemo(() => {
  // Expensive calculation here
  return habits.map((habit) => ({
    habitId: habit.id,
    streak: calculateStreak(habit.logs),
  }));
}, [habits]); // Only recalculate when habits change
```

### Challenge 10: Optimize

**Your Task:**

1. Identify expensive calculations in your code
2. Wrap them in `useMemo`
3. Use React DevTools to check re-renders
4. Measure the difference

---

## 🎓 Learning Resources

### Concepts to Study:

1. **JavaScript Dates:** MDN Date documentation
2. **React Hooks:** useEffect, useMemo, useCallback
3. **Derived State:** React docs on "Choosing the State Structure"
4. **Component Composition:** Thinking in React

### Debugging Tools:

1. **React DevTools:** See component props and state
2. **Console.log:** Your best friend
3. **Debugger:** Set breakpoints in browser
4. **Supabase Dashboard:** Check your database directly

---

## 📝 Suggested Learning Path

### Week 1: Streak Calculation

- [ ] Day 1-2: Understand the logic, write pseudocode
- [ ] Day 3-4: Implement basic streak calculation
- [ ] Day 5: Test with different scenarios
- [ ] Day 6-7: Integrate into useHabits hook

### Week 2: Dashboard Redesign

- [ ] Day 1-2: Build ProgressSummary component
- [ ] Day 3-4: Update HabitCard with streaks
- [ ] Day 5: Implement habit filtering (due today)
- [ ] Day 6-7: Polish and test

### Week 3: Refinement

- [ ] Day 1-2: Handle edge cases
- [ ] Day 3-4: Optimize performance
- [ ] Day 5-6: Improve styling and UX
- [ ] Day 7: Final testing and bug fixes

---

## 💡 Tips for Success

### 1. Start Small

Don't try to build everything at once. Get one piece working, then move to the next.

### 2. Test Frequently

After every small change, test it. Don't write 100 lines before testing.

### 3. Use Console.log

Print everything! See what your variables contain at each step.

### 4. Read Error Messages

They're trying to help you. Read them carefully.

### 5. Take Breaks

If you're stuck for 30+ minutes, take a break. Fresh eyes help.

### 6. Ask Specific Questions

Instead of "it doesn't work," ask "why does calculateStreak return 0 when I have 3 logs?"

### 7. Document Your Learning

Keep notes on what you learned, what confused you, what clicked.

---

## 🤔 When to Ask for Help

**Try First:**

1. Read the error message
2. Console.log the variables
3. Check the React DevTools
4. Review the documentation
5. Try a different approach

**Ask for Help When:**

- You've been stuck for 1+ hour
- You don't understand a concept (not just syntax)
- You need clarification on requirements
- You want feedback on your approach

**How to Ask:**

- Share what you've tried
- Share the specific error or unexpected behavior
- Share relevant code snippets
- Ask specific questions

---

## 📊 Progress Tracking

Create a file called `MY_PROGRESS.md` and track:

- [ ] Understood streak calculation logic
- [ ] Implemented basic streak function
- [ ] Tested streak function with sample data
- [ ] Integrated streaks into useHabits hook
- [ ] Created ProgressSummary component
- [ ] Updated HabitCard with streaks
- [ ] Implemented habit filtering
- [ ] Tested all scenarios
- [ ] Optimized performance
- [ ] Polished UI/UX

---

## 🎯 Success Criteria

You'll know you're done when:

1. ✅ Streaks display correctly for all habits
2. ✅ Streaks update immediately when completing habits
3. ✅ Dashboard shows only today's due habits
4. ✅ Progress summary shows accurate stats
5. ✅ No console errors
6. ✅ App feels responsive and fast
7. ✅ You understand every line of code you wrote

---

**Remember:** The goal isn't just to build features, it's to understand HOW and WHY they work. Take your time, experiment, and learn!

Good luck! 🚀

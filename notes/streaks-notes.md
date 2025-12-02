# Study Notes: Incremental Streak Calculation

## 🎯 The Big Idea

**Instead of calculating streaks by looping through history, store the streak as you go and update it incrementally.**

Think of it like a pedometer (step counter):

- **Bad way:** Count all your steps from the beginning of time every time you take a step
- **Good way:** Remember yesterday's count, add today's steps

---

## 📊 Three Approaches Compared

### Approach 1: JavaScript Calculation (Worst)

```
User loads page
    ↓
Fetch ALL logs from database (1000+ rows)
    ↓
Loop through logs in JavaScript
    ↓
Count consecutive days
    ↓
Display streak

Time: ~300ms
Network: 100KB
Scales: ❌ NO
```

### Approach 2: Database Function (Better)

```
User loads page
    ↓
Call database function
    ↓
Database loops through logs
    ↓
Returns streak number
    ↓
Display streak

Time: ~20ms
Network: 2KB
Scales: ⚠️ OK (but not great)
```

### Approach 3: Incremental Updates (Best!)

```
User loads page
    ↓
Fetch habits (streak already stored!)
    ↓
Display streak

When user completes habit:
    ↓
Compare: today vs last_completed
    ↓
If consecutive: streak + 1
If gap: streak = 1
    ↓
Update streak in database

Time: ~5ms
Network: 1KB
Scales: ✅ YES (millions of users!)
```

---

## 🔑 The Core Algorithm

### Data We Store

```sql
habits table:
- current_streak (integer)      -- Current streak count
- last_completed (date)         -- When last completed
```

### Logic When Marking Complete

```
1. Get last_completed date from database
2. Calculate: days_diff = today - last_completed

3. IF days_diff = 0:
     → Same day, do nothing (already counted)

   ELSE IF days_diff = 1:
     → Consecutive day! Increment: streak = streak + 1
     → Update: last_completed = today

   ELSE (days_diff > 1):
     → Gap found! Reset: streak = 1
     → Update: last_completed = today
```

---

## 📅 Example Scenarios

### Scenario 1: Building a Streak (Consecutive Days)

```
Day 1 (Dec 1):
- User completes habit
- last_completed: NULL → Dec 1
- current_streak: 0 → 1

Day 2 (Dec 2):
- User completes habit
- days_diff = Dec 2 - Dec 1 = 1 (consecutive!)
- current_streak: 1 → 2
- last_completed: Dec 1 → Dec 2

Day 3 (Dec 3):
- User completes habit
- days_diff = Dec 3 - Dec 2 = 1 (consecutive!)
- current_streak: 2 → 3
- last_completed: Dec 2 → Dec 3

Result: 3-day streak! 🔥🔥🔥
```

### Scenario 2: Breaking a Streak (Missed Day)

```
Current state:
- current_streak: 5
- last_completed: Dec 1

User forgets Dec 2...

Dec 3:
- User completes habit
- days_diff = Dec 3 - Dec 1 = 2 (gap!)
- current_streak: 5 → 1 (reset)
- last_completed: Dec 1 → Dec 3

Result: Streak broken, starts fresh at 1
```

### Scenario 3: Completing Twice Same Day

```
Current state:
- current_streak: 7
- last_completed: Dec 5

Later on Dec 5:
- User clicks complete again
- days_diff = Dec 5 - Dec 5 = 0 (same day!)
- current_streak: stays 7 (no change)
- last_completed: stays Dec 5

Result: No double-counting, streak stays at 7
```

---

## 💻 The Database Code Explained

### Adding Columns

```sql
ALTER TABLE habits
ADD COLUMN current_streak integer DEFAULT 0,
ADD COLUMN last_completed date;
```

**What this does:**

- Adds two new fields to store streak data
- `current_streak` starts at 0 for new habits
- `last_completed` is NULL until first completion

### The Update Function

```sql
CREATE OR REPLACE FUNCTION update_habit_streak(
  p_habit_id uuid,
  p_user_id uuid,
  p_completed_date date
)
```

**Parameters:**

- `p_habit_id`: Which habit?
- `p_user_id`: Which user?
- `p_completed_date`: What date was it completed?

```sql
-- Get current values
SELECT current_streak, last_completed
INTO v_current_streak, v_last_completed
FROM habits
WHERE id = p_habit_id;
```

**Step 1:** Fetch current streak and last completion date

```sql
-- Calculate difference
v_days_diff := p_completed_date - v_last_completed;
```

**Step 2:** How many days between completions?

```sql
-- Decision tree
IF v_days_diff = 0 THEN
  RETURN; -- Same day, do nothing
ELSIF v_days_diff = 1 THEN
  UPDATE ... SET current_streak = current_streak + 1; -- Consecutive!
ELSE
  UPDATE ... SET current_streak = 1; -- Gap, reset
END IF;
```

**Step 3:** Update based on date difference

### Database Triggers (Automatic Updates!)

```sql
CREATE TRIGGER on_habit_log_insert
  AFTER INSERT ON habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_habit_streak();
```

**What this does:**

- Automatically runs AFTER a log is inserted
- Calls `update_habit_streak()` function
- No manual intervention needed!

**Flow:**

```
User clicks "Mark Complete"
    ↓
React inserts row into habit_logs
    ↓
✨ Trigger automatically fires ✨
    ↓
Function updates streak
    ↓
React fetches updated habit
    ↓
UI shows new streak
```

---

## ⚡ Performance Math

### Time Complexity

**Loop Method:** O(n) where n = number of days

```
1 day:    1 operation
10 days:  10 operations
100 days: 100 operations
1000 days: 1000 operations
```

**Incremental Method:** O(1) - constant time

```
1 day:    1 comparison
10 days:  1 comparison
100 days: 1 comparison
1000 days: 1 comparison
```

### Real-World Impact

| Scenario                         | Loop Method       | Incremental          | Improvement    |
| -------------------------------- | ----------------- | -------------------- | -------------- |
| Single user, 10 habits, 100 days | 300ms             | 5ms                  | **60x faster** |
| 1000 users checking at once      | 300,000ms (5 min) | 5,000ms (5 sec)      | **60x faster** |
| 1,000,000 users                  | CRASH 💥          | 5,000,000ms (83 min) | **Scales!**    |

---

## 🧠 Key Computer Science Concepts

### 1. Time Complexity: O(1) vs O(n)

**O(n) - Linear Time:**

```
Time increases linearly with data size
10 items = 10 operations
100 items = 100 operations
```

**O(1) - Constant Time:**

```
Time stays the same regardless of data size
10 items = 1 operation
100 items = 1 operation
```

**Why it matters:**

- 1 user: Small difference
- 1 million users: HUGE difference

### 2. Incremental Computation

**Definition:** Update a result based on changes, not from scratch

**Examples:**

- Bank balance (add transactions, don't recount all money)
- Social media followers (increment count, don't recount everyone)
- Video game score (add points, don't recalculate from beginning)

### 3. Database Triggers

**Definition:** Automatic actions that fire when data changes

**Like:**

- Motion sensor lights (trigger = movement)
- Email auto-reply (trigger = incoming email)
- Domino effect (trigger = first domino falling)

**In our case:**

- Trigger = inserting a habit log
- Action = update streak

---

## 🎯 When to Use Incremental Updates

### ✅ Good Use Cases:

- Counters (likes, views, followers)
- Streaks (consecutive days)
- Running totals (balance, score)
- Statistics (average, min, max)

### ❌ Bad Use Cases:

- Complex calculations that can't be broken down
- Situations where history might change
- One-time calculations

---

## 🐛 Edge Cases to Handle

### 1. First Completion Ever

```
last_completed: NULL
current_streak: 0

Action: Set streak to 1, record today
```

### 2. Completing in the Past (Backfilling)

```
User completes habit for yesterday

last_completed: Dec 1
completing: Nov 30 (earlier!)

Action: Don't update streak (out of order)
```

### 3. Timezone Issues

```
User travels across timezones
Completes at 11 PM PST = 2 AM EST (next day)

Solution: Use user's local date, not server time
```

### 4. Unmarking/Deletion

```
User unchecks today's completion

Action: Decrease streak by 1
BUT: Can't accurately rebuild if unmarking old days
Workaround: Only allow unmarking today's completion
```

---

## 🔄 Migration Strategy

If you already have existing data with the old method:

### Step 1: Add New Columns

```sql
ALTER TABLE habits ADD COLUMN current_streak integer DEFAULT 0;
ALTER TABLE habits ADD COLUMN last_completed date;
```

### Step 2: Backfill Data (One-Time Script)

```sql
-- For each habit, calculate current streak from logs
UPDATE habits h
SET
  current_streak = calculate_existing_streak(h.id),
  last_completed = (
    SELECT MAX(completed_date)
    FROM habit_logs
    WHERE habit_id = h.id
  );
```

### Step 3: Enable Triggers

```sql
CREATE TRIGGER ... (as shown above)
```

### Step 4: Switch Code

Use the new React hook that reads from `current_streak`

---

## 📊 Monitoring & Validation

### How to Verify It's Working

**Test 1: Complete habit for first time**

```sql
SELECT current_streak FROM habits WHERE id = 'xxx';
-- Expected: 1
```

**Test 2: Complete next day (consecutive)**

```sql
SELECT current_streak FROM habits WHERE id = 'xxx';
-- Expected: 2
```

**Test 3: Skip a day, then complete**

```sql
SELECT current_streak FROM habits WHERE id = 'xxx';
-- Expected: 1 (reset)
```

### Performance Monitoring

```sql
-- Check query speed
EXPLAIN ANALYZE
SELECT * FROM habits WHERE user_id = 'xxx';

-- Should use index, take <5ms
```

---

## 💡 Real-World Analogies

### 1. Pedometer (Step Counter)

**Bad:** Count all steps from birth
**Good:** Remember yesterday's count, add today

### 2. Thermometer

**Bad:** Record all temperatures ever, calculate average
**Good:** Remember last temperature, note change

### 3. Scoreboard

**Bad:** Recount all points from beginning of game
**Good:** Add points as they're scored

---

## ✅ Summary Checklist

After implementing incremental streaks, you should have:

- [ ] Added `current_streak` and `last_completed` columns
- [ ] Created `update_habit_streak()` function
- [ ] Set up database triggers (INSERT and DELETE)
- [ ] Updated React hook to use stored streaks
- [ ] Tested edge cases (first time, consecutive, gap)
- [ ] Verified performance improvement
- [ ] Documented the logic for future maintainers

---

## 🚀 Key Takeaways

1. **Store results incrementally** instead of recalculating from scratch
2. **Use database triggers** for automatic updates
3. **O(1) scales infinitely better** than O(n)
4. **Simplicity = fewer bugs** and easier maintenance
5. **Date comparison is cheap**, looping is expensive

---

**Remember:** The best optimization is often rethinking the problem, not optimizing the solution!

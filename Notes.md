# Complete Learning Reference Guide - React, TypeScript & Supabase

## Table of Contents

1. [React Router & Navigation](#react-router--navigation)
2. [TypeScript Basics](#typescript-basics)
3. [Form Events & Handling](#form-events--handling)
4. [Authentication with Supabase](#authentication-with-supabase)
5. [React Hooks](#react-hooks)
6. [Conditional Rendering](#conditional-rendering)
7. [Styling with Tailwind CSS](#styling-with-tailwind-css)
8. [Environment Variables](#environment-variables)
9. [Import/Export Patterns](#importexport-patterns)

---

## React Router & Navigation

### Q: Why did my page stop rendering when I uncommented the Routes?

**Problem:**

```jsx
<div className="min-h-screen flex justify-center items-center text-white">
  <div className="outline outline-red-400 my-1 flex flex-col justify-center items-center w-fit">
    <p className="text-4xl ">welcome to atoma</p>
    {/* ... buttons ... */}
  </div>

  {/* <Routes>
    <Route path="/signin" element={<SignIn />} />
    <Route path="/signup" element={<SignUp />} />
  </Routes> */}
</div>
```

**Issue:** Routes were inside the centered flex container, breaking the layout.

**Solution:** Move Routes outside and make home page a route:

```jsx
<div className="min-h-screen">
  <Routes>
    <Route
      path="/"
      element={
        <div className="min-h-screen flex justify-center items-center text-white">
          {/* Home page content */}
        </div>
      }
    />
    <Route path="/signin" element={<SignIn />} />
    <Route path="/signup" element={<SignUp />} />
  </Routes>
</div>
```

**Why:** Each route needs to render independently. Nesting routes inside layout divs causes conflicts. Think of Routes as a traffic controller - it decides which component to show based on the URL, and each route needs its own space.

---

## TypeScript Basics

### Q: What does `useState<string | null>(null)` mean?

**Code:**

```typescript
const [error, setError] = useState<string | null>(null);
```

**Breakdown:**

- `useState` - React hook to store data
- `<string | null>` - TypeScript type annotation
  - `string` - Can be text like "Invalid password"
  - `|` - OR operator
  - `null` - Can be empty/no error
- `(null)` - Initial value (starts with no error)

**Why needed:** TypeScript needs to know what types of values can be stored. Without it, you get type errors when trying to set error messages.

**Example:**

```typescript
// Valid operations:
setError("Password too short"); // ✅ string
setError(null); // ✅ null
setError(undefined); // ❌ Error! Not in the type
setError(123); // ❌ Error! Number not allowed
```

**Real-world analogy:** It's like telling TypeScript "this variable is a box that can hold either a text message or nothing at all, but never anything else."

---

### Q: What does the `?` mean in `user.user_metadata?.username`?

**Code:**

```typescript
setUsername(user.user_metadata?.username);
```

**Concept:** Optional Chaining

**Without `?` (crashes if undefined):**

```typescript
user.user_metadata.username; // ❌ Error if user_metadata doesn't exist
```

**With `?` (safe):**

```typescript
user.user_metadata?.username; // ✅ Returns undefined if user_metadata doesn't exist
```

**Step-by-step evaluation:**

1. Check if `user_metadata` exists
2. If YES → access `.username`
3. If NO → return `undefined` (don't crash)

**Real-world analogy:**

```typescript
// Without ?
"Go into the box and get the username";
// Crashes if there's no box

// With ?
"If there's a box, open it and get the username. Otherwise, just say 'nothing'";
```

**More examples:**

```typescript
// Chaining multiple levels
user?.profile?.settings?.theme; // Safely checks each level

// With fallback value using ?? (nullish coalescing)
const theme = user?.profile?.settings?.theme ?? "dark"; // Use 'dark' if undefined

// Array access
users?.[0]?.name; // Get first user's name if array exists

// Function call
user?.getProfile?.(); // Call function only if it exists
```

**When to use it:**

- Accessing nested object properties
- Working with API data that might be incomplete
- Optional function parameters
- Preventing "Cannot read property of undefined" errors

---

### Q: What does `type FormEvent` mean and why the special import?

**Error:**

```
'FormEvent' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
```

**What is FormEvent?**

A **FormEvent** is TypeScript's way of describing what happens when you submit a form.

**The Fix:**

```typescript
import { useState, type FormEvent } from "react";
// or
import type { FormEvent } from "react";
```

**Why `type` keyword?**

- TypeScript needs to know this is ONLY for type checking
- It gets removed at runtime (doesn't exist in JavaScript)
- The `type` keyword tells the compiler "this is just for types, not actual code"

**What FormEvent contains:**

```typescript
const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault(); // Stop form from refreshing page
  // e also contains: target, currentTarget, timeStamp, type, bubbles, etc.
};
```

**Breaking down the type:**

```typescript
FormEvent<HTMLFormElement>
    ↓           ↓
  Event type   What element triggered it
```

**Other common event types:**

```typescript
MouseEvent<HTMLButtonElement>; // Clicking a button
ChangeEvent<HTMLInputElement>; // Typing in an input
KeyboardEvent<HTMLInputElement>; // Pressing keys
FocusEvent<HTMLInputElement>; // Focusing/blurring an input
```

**Example with different events:**

```typescript
// Form submission
const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log("Form submitted");
};

// Button click
const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
  console.log("Button clicked at:", e.clientX, e.clientY);
};

// Input change
const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

// Key press
const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    submitForm();
  }
};
```

---

## Form Events & Handling

### Q: What does `e.preventDefault()` do?

**Code:**

```typescript
const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault(); // Stops the form from refreshing the page
  // ...rest of code
};
```

**Without preventDefault:**

1. User clicks submit
2. Browser refreshes the entire page
3. All your React state is lost
4. Form data gets sent to server URL (old-school HTML behavior)
5. User sees a blank page or error

**With preventDefault:**

1. User clicks submit
2. Normal browser behavior is STOPPED
3. Your JavaScript function handles everything
4. Page stays intact, React manages the data
5. Smooth user experience

**Visual example:**

```typescript
// WITHOUT preventDefault
User clicks submit → Page refreshes → You lose everything → Bad UX
❌ All state lost
❌ Loading indicators disappear
❌ Error messages vanish
❌ Form resets

// WITH preventDefault
User clicks submit → Your function runs → API call happens → User stays on page → Good UX
✅ State preserved
✅ Loading indicators work
✅ Error messages display
✅ Smooth experience
```

**Real-world analogy:**
Imagine ordering food at a restaurant. Without `preventDefault()`, every time you add an item to your order, the waiter throws away your entire order and makes you start over. With `preventDefault()`, you can keep adding items to the same order.

---

## Authentication with Supabase

### Q: How does user sign up work? Explain the code step by step.

**Full Code:**

```typescript
const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault(); // Stop form from refreshing page
  setLoading(true); // Show loading state on button
  setError(null); // Clear any old error messages

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  // Send email/password to Supabase and wait for response

  setLoading(false); // Hide loading state

  if (error) {
    setError(error.message); // Show error to user
  } else {
    alert("Check your email for confirmation link!");
    navigate("/signin"); // Redirect to sign in page
  }
};
```

**What happens behind the scenes:**

1. **User fills form:** React stores values in state via `onChange`

   ```typescript
   onChange={(e) => setEmail(e.target.value)}
   ```

2. **User clicks submit:** `handleSignUp` function runs

3. **Prevent refresh:** `e.preventDefault()` stops browser default behavior

4. **Set loading state:** Button shows "Loading..." instead of "Sign Up"

   ```typescript
   {
     loading ? "Loading..." : "Sign Up";
   }
   ```

5. **Call Supabase API:**

   ```typescript
   await supabase.auth.signUp({ email, password });
   ```

   - Sends data to Supabase servers over HTTPS
   - `await` means "wait for response before continuing"
   - Supabase creates user account in database
   - Sends confirmation email to user
   - Returns either `data` (success) or `error` (failure)

6. **Handle response:**
   - If `error` exists → Show error message to user
   - If successful → Alert user and redirect to sign in

**Diagram:**

```
User Input → State Storage → Form Submit → preventDefault()
→ API Call to Supabase → Wait for Response → Handle Success/Error
```

**Common Tailwind Spacing:**

| Class   | Size               | Use Case                         |
| ------- | ------------------ | -------------------------------- |
| `p-2`   | 8px                | Tight spacing, buttons           |
| `p-4`   | 16px               | Default spacing, mobile          |
| `p-8`   | 32px               | Comfortable spacing, desktop     |
| `mb-4`  | 16px bottom margin | Space between elements           |
| `gap-4` | 16px gap           | Space between flex/grid children |

---

### Q: How do I fix the Home button staying visible while scrolling?

**Problem:**

```typescript
<div className="p-4">
  <HomeButton />
  <div className="min-h-screen max-w-7xl flex items-center justify-center">
    {/* Form here */}
  </div>
</div>
```

**Issue:** HomeButton is inside the scrolling container, so it disappears when you scroll down.

**Solution 1: Fixed Position (Recommended)**

Make the HomeButton stay at the top even when scrolling:

```typescript
<div className="min-h-screen">
  {/* Fixed HomeButton at top */}
  <div className="fixed top-4 left-4 z-10">
    <HomeButton />
  </div>

  {/* Centered form */}
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="w-96 p-8 border border-white rounded-xl text-white">
      <h2 className="text-3xl mb-6">Sign In</h2>
      {/* Form content */}
    </div>
  </div>
</div>
```

**What this does:**

- `fixed` - Removes element from normal flow, stays in place when scrolling
- `top-4 left-4` - Position 16px from top and left edges
- `z-10` - Ensures button stays on top of other content (z-index)

**Solution 2: Flex Layout**

If you want everything to scroll together:

```typescript
<div className="min-h-screen flex flex-col p-4">
  {/* HomeButton at top */}
  <div className="mb-4">
    <HomeButton />
  </div>

  {/* Form takes remaining space and centers */}
  <div className="flex-1 flex items-center justify-center">
    <div className="w-96 p-8 border border-white rounded-xl text-white">
      {/* Form content */}
    </div>
  </div>
</div>
```

**What this does:**

- `flex flex-col` - Stacks button and form vertically
- `flex-1` - Form container takes all remaining space
- Button and form scroll together

**Which to use:**

- **Solution 1 (Fixed)**: Modern, keeps navigation always accessible
- **Solution 2 (Flex)**: Traditional, everything scrolls naturally

---

### Q: How do I center username text to match Dashboard text on y-axis?

**Problem:**

```typescript
<div className="outline p-2 flex flex-row justify-between items-center text-center">
  <span className="text-2xl font-bold">Dashboard</span>
  <span className="outline flex items-center">
    {username && <p className="mb-4">Welcome, {username}!</p>}
  </span>
</div>
```

**Issue:** The `mb-4` (margin-bottom) on the `<p>` tag pushes it off-center.

**Solution:**

```typescript
<div className="outline p-2 flex flex-row justify-between items-center text-center">
  <span className="text-2xl font-bold">Dashboard</span>
  <span className="outline flex items-center">
    {username && <p>Welcome, {username}!</p>}
  </span>
</div>
```

**Why this works:**

- `items-center` on parent div vertically centers all children
- The `mb-4` was adding 16px bottom margin, offsetting vertical centering
- Removing `mb-4` lets `items-center` work properly
- Both elements now align perfectly on y-axis

**Understanding flexbox alignment:**

```typescript
// items-center: Aligns children on cross-axis (vertical in flex-row)
<div className="flex flex-row items-center">
  <span>Item 1</span>  // Centered vertically
  <span>Item 2</span>  // Centered vertically
</div>

// justify-between: Spreads children apart on main-axis (horizontal in flex-row)
<div className="flex flex-row justify-between">
  <span>Left</span>   // Pushed to left
  <span>Right</span>  // Pushed to right
</div>
```

---

## Environment Variables

### Q: Why do I need to restart the server for environment variables?

**Environment Variables in Vite:**

Vite (your build tool) reads the `.env` file **once at startup**. Any changes after that are ignored until restart.

**When to restart:**

- Created new `.env` file
- Added new variables
- Changed existing variable values
- Renamed variables

**How to restart:**

```bash
Ctrl + C          # Stop the dev server
npm run dev       # Start it again
```

**Environment variable naming rules:**

**Vite (what you're using):**

```dotenv
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

- Must start with `VITE_`
- Only variables with `VITE_` prefix are exposed to your app
- Access with `import.meta.env.VITE_VARIABLE_NAME`

**Create React App (different framework):**

```dotenv
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_key_here
```

- Must start with `REACT_APP_`
- Access with `process.env.REACT_APP_VARIABLE_NAME`

**Your Issue:**

You had:

```dotenv
REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publ...
```

But your code tried to access:

```typescript
import.meta.env.VITE_SUPABASE_ANON_KEY; // Looking for VITE_ prefix
```

**The Fix:**

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Best practices:**

1. **Never commit `.env` to git**

   ```gitignore
   # .gitignore
   .env
   .env.local
   ```

2. **Create `.env.example` template**

   ```dotenv
   # .env.example
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Keep sensitive keys out of frontend**

   - Frontend env vars are visible in browser
   - Only use "anon" (anonymous) keys
   - Keep "service_role" keys on backend only

4. **Different environments**

   ```dotenv
   # .env.development
   VITE_API_URL=http://localhost:3000

   # .env.production
   VITE_API_URL=https://api.production.com
   ```

---

## Import/Export Patterns

### Q: Can I import a .js file into a .tsx file?

**Answer:** Yes, absolutely!

```typescript
// supabaseClient.js (JavaScript file)
export const supabase = createClient(url, key);

// SignUp.tsx (TypeScript file)
import { supabase } from "../lib/supabaseClient"; // ✅ Works fine
```

**Why it works:**

- TypeScript is a superset of JavaScript
- TypeScript can import and use JavaScript modules
- The file extension doesn't matter for imports (you don't include it)

**Import rules:**

**Named export (use curly braces):**

```javascript
// supabaseClient.js
export const supabase = createClient(url, key);

// Usage
import { supabase } from "../lib/supabaseClient";
```

**Default export (no curly braces):**

```javascript
// supabaseClient.js
const supabase = createClient(url, key);
export default supabase;

// Usage
import supabase from "../lib/supabaseClient";
```

**Your Error:**

You had:

```javascript
// supabaseClient.js
export default supabase; // Default export
```

But imported as:

```typescript
import { supabase } from "../lib/supabaseClient"; // Named import ❌
```

**The fix:**

```typescript
import supabase from "../lib/supabaseClient"; // Matches default export ✅
```

**Or change the export:**

```javascript
// supabaseClient.js
export const supabase = createClient(url, key); // Named export
```

**Multiple exports:**

```javascript
// utils.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
export default multiply;

// Usage
import multiply from "./utils"; // Default
import { add, subtract } from "./utils"; // Named
import multiply, { add, subtract } from "./utils"; // Both
```

**TypeScript-specific imports:**

```typescript
// Using type-only imports
import type { User } from "./types"; // Only for types
import { supabase } from "./supabase"; // For actual code
```

---

## CRUD Operations with Supabase

### Q: How do I build a habit tracker with CRUD? Guide me step by step.

**CRUD stands for:**

- **C**reate - Add new habits
- **R**ead - View/display habits
- **U**pdate - Edit existing habits
- **D**elete - Remove habits

Let's build this piece by piece so you understand each part.

---

### Step 1: Understanding the Data Structure

**What data do we need for each habit?**

```typescript
type Habit = {
  id: string; // Unique identifier (Supabase auto-generates)
  user_id: string; // Which user owns this habit
  title: string; // "Exercise", "Read", etc.
  description?: string; // Optional extra info (? means optional)
  frequency: string; // "daily", "weekly", etc.
  created_at: string; // When it was created (auto-generated)
};
```

**Why each field:**

- `id` - Every record needs unique ID to identify it
- `user_id` - Links habit to a user (so you only see YOUR habits)
- `title` - The main habit name
- `description` - Optional details
- `frequency` - How often you do it
- `created_at` - Timestamp for sorting/tracking

---

### Step 2: Set Up Database Table

Go to Supabase Dashboard → SQL Editor and run:

```sql
create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  frequency text default 'daily' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

**What this does:**

- `uuid` - Universal Unique Identifier (random ID)
- `gen_random_uuid()` - Auto-generates unique ID
- `primary key` - Makes `id` the main identifier
- `references auth.users` - Links to Supabase auth system
- `on delete cascade` - If user deleted, delete their habits too
- `not null` - Field is required
- `default 'daily'` - If no frequency specified, use 'daily'
- `timestamp with time zone` - Stores date/time with timezone

**Add Row Level Security (RLS):**

```sql
-- Enable RLS (users can only see their own data)
alter table habits enable row level security;

-- Users can view their own habits
create policy "Users can view their own habits"
  on habits for select
  using (auth.uid() = user_id);

-- Users can insert their own habits
create policy "Users can insert their own habits"
  on habits for insert
  with check (auth.uid() = user_id);

-- Users can update their own habits
create policy "Users can update their own habits"
  on habits for update
  using (auth.uid() = user_id);

-- Users can delete their own habits
create policy "Users can delete their own habits"
  on habits for delete
  using (auth.uid() = user_id);
```

**What RLS does:**

- `auth.uid()` - Gets current logged-in user's ID
- `using (auth.uid() = user_id)` - Only allow if habit belongs to current user
- Prevents users from seeing/editing other people's habits
- Security happens at database level (can't be bypassed)

---

### Step 3: Read (Fetch and Display Habits)

**Create Dashboard.tsx:**

```typescript
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

type Habit = {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  created_at: string;
};

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]); // Store array of habits
  const [loading, setLoading] = useState(true);

  // Fetch habits when component loads
  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("habits") // Which table
      .select("*") // Get all columns
      .order("created_at", { ascending: false }); // Newest first

    if (error) {
      console.error("Error fetching habits:", error);
    } else {
      setHabits(data || []); // Store in state
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-4 text-white">
      <h1 className="text-4xl mb-8">My Habits</h1>

      {loading ? (
        <p>Loading habits...</p>
      ) : habits.length === 0 ? (
        <p>No habits yet. Create one!</p>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit) => (
            <div key={habit.id} className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-bold">{habit.title}</h3>
              {habit.description && (
                <p className="text-gray-400">{habit.description}</p>
              )}
              <span className="text-sm text-blue-400">{habit.frequency}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Breaking down the fetch:**

```typescript
const { data, error } = await supabase
  .from("habits") // Talk to 'habits' table
  .select("*") // Select all columns (id, title, description, etc.)
  .order("created_at", { ascending: false }); // Sort by date, newest first
```

**What happens:**

1. `supabase.from('habits')` - Connect to habits table
2. `.select('*')` - Get all columns (like SQL SELECT \*)
3. `.order(...)` - Sort results by created_at date
4. `await` - Wait for database to respond
5. Returns `{ data, error }` - Either data or error (never both)

**Displaying habits:**

```typescript
{
  habits.map((habit) => <div key={habit.id}>{/* Display each habit */}</div>);
}
```

- `.map()` - Loop through each habit in array
- `key={habit.id}` - React needs unique key for each item in list
- Returns JSX for each habit

---

### Step 4: Create (Add New Habits)

**Add form to Dashboard:**

```typescript
export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");

  const handleCreateHabit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in");
      return;
    }

    // Insert new habit
    const { data, error } = await supabase
      .from("habits")
      .insert([
        {
          user_id: user.id,
          title,
          description,
          frequency,
        },
      ])
      .select(); // Return the inserted row

    if (error) {
      console.error("Error creating habit:", error);
      alert("Failed to create habit");
    } else {
      // Add new habit to state (update UI immediately)
      setHabits([data[0], ...habits]);

      // Clear form
      setTitle("");
      setDescription("");
      setFrequency("daily");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-4 text-white">
      <h1 className="text-4xl mb-8">My Habits</h1>

      {/* Create Habit Form */}
      <form
        onSubmit={handleCreateHabit}
        className="mb-8 p-4 bg-gray-800 rounded-lg"
      >
        <h2 className="text-2xl mb-4">Create New Habit</h2>

        <input
          type="text"
          placeholder="Habit title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 rounded"
          required
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 rounded"
          rows={3}
        />

        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 rounded"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Habit"}
        </button>
      </form>

      {/* Display Habits */}
      {/* ... existing code ... */}
    </div>
  );
}
```

**Breaking down the insert:**

```typescript
const { data, error } = await supabase
  .from("habits")
  .insert([
    {
      user_id: user.id,
      title,
      description,
      frequency,
    },
  ])
  .select();
```

**What happens:**

1. `.from('habits')` - Target habits table
2. `.insert([{ ... }])` - Insert new row (array of objects)
3. Must provide `user_id` (required by RLS policy)
4. `.select()` - Return the inserted row (so we can add it to UI)
5. Supabase auto-generates `id` and `created_at`

**Optimistic UI update:**

```typescript
setHabits([data[0], ...habits]);
```

- `data[0]` - The newly created habit
- `...habits` - Spread operator (existing habits)
- `[new, ...old]` - New habit at beginning of array
- Updates UI immediately without refetching

---

### Step 5: Update (Edit Habits)

**Add edit functionality:**

```typescript
export default function Dashboard() {
  // ... existing state ...
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFrequency, setEditFrequency] = useState("");

  const startEditing = (habit: Habit) => {
    setEditingId(habit.id);
    setEditTitle(habit.title);
    setEditDescription(habit.description || "");
    setEditFrequency(habit.frequency);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditFrequency("");
  };

  const handleUpdateHabit = async (id: string) => {
    setLoading(true);

    const { error } = await supabase
      .from("habits")
      .update({
        title: editTitle,
        description: editDescription,
        frequency: editFrequency,
      })
      .eq("id", id); // Where id equals this habit's id

    if (error) {
      console.error("Error updating habit:", error);
      alert("Failed to update habit");
    } else {
      // Update in UI
      setHabits(
        habits.map((habit) =>
          habit.id === id
            ? {
                ...habit,
                title: editTitle,
                description: editDescription,
                frequency: editFrequency,
              }
            : habit
        )
      );

      cancelEditing();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-4 text-white">
      {/* ... create form ... */}

      {/* Display Habits */}
      <div className="grid gap-4">
        {habits.map((habit) => (
          <div key={habit.id} className="p-4 bg-gray-800 rounded-lg">
            {editingId === habit.id ? (
              // Edit mode
              <div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 mb-2 bg-gray-700 rounded"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2 mb-2 bg-gray-700 rounded"
                  rows={2}
                />
                <select
                  value={editFrequency}
                  onChange={(e) => setEditFrequency(e.target.value)}
                  className="w-full p-2 mb-2 bg-gray-700 rounded"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateHabit(habit.id)}
                    className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <div>
                <h3 className="text-xl font-bold">{habit.title}</h3>
                {habit.description && (
                  <p className="text-gray-400">{habit.description}</p>
                )}
                <span className="text-sm text-blue-400">{habit.frequency}</span>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => startEditing(habit)}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Breaking down the update:**

```typescript
const { error } = await supabase
  .from("habits")
  .update({
    title: editTitle,
    description: editDescription,
    frequency: editFrequency,
  })
  .eq("id", id);
```

**What happens:**

1. `.update({ ... })` - Specify which fields to update
2. `.eq('id', id)` - "WHERE id = ?" (SQL equivalent)
3. Only updates the matching row
4. RLS ensures you can only update your own habits

**UI state management:**

```typescript
setHabits(habits.map(habit =>
  habit.id === id
    ? { ...habit, title: editTitle, ... }  // Update this one
    : habit                                 // Keep others unchanged
));
```

- `.map()` - Transform each habit
- Check if this is the habit we edited
- If yes, create new object with updated values
- If no, keep original
- React re-renders with updated state

---

### Step 6: Delete (Remove Habits)

**Add delete functionality:**

```typescript
const handleDeleteHabit = async (id: string) => {
  if (!confirm("Are you sure you want to delete this habit?")) {
    return;
  }

  setLoading(true);

  const { error } = await supabase.from("habits").delete().eq("id", id);

  if (error) {
    console.error("Error deleting habit:", error);
    alert("Failed to delete habit");
  } else {
    // Remove from UI
    setHabits(habits.filter((habit) => habit.id !== id));
  }

  setLoading(false);
};

// In the display section, add delete button:
<button
  onClick={() => handleDeleteHabit(habit.id)}
  className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
>
  Delete
</button>;
```

**Breaking down the delete:**

```typescript
const { error } = await supabase.from("habits").delete().eq("id", id);
```

**What happens:**

1. `.delete()` - Delete operation
2. `.eq('id', id)` - Which row to delete
3. RLS ensures you can only delete your own habits
4. Row is permanently removed from database

**UI update:**

```typescript
setHabits(habits.filter((habit) => habit.id !== id));
```

- `.filter()` - Keep only items that match condition
- `habit.id !== id` - Keep all habits EXCEPT the deleted one
- Returns new array without deleted habit
- React re-renders with updated list

---

### Summary: CRUD Operations

**Create:**

```typescript
await supabase
  .from("habits")
  .insert([{ user_id, title, description, frequency }])
  .select();
```

**Read:**

```typescript
await supabase
  .from("habits")
  .select("*")
  .order("created_at", { ascending: false });
```

**Update:**

```typescript
await supabase
  .from("habits")
  .update({ title, description, frequency })
  .eq("id", id);
```

**Delete:**

```typescript
await supabase.from("habits").delete().eq("id", id);
```

**Pattern for all operations:**

1. Call Supabase method
2. Wait for response (`await`)
3. Check for errors
4. Update UI state
5. Show feedback to user

This is the foundation of most database interactions you'll do! errors you might see:\*\*

```typescript
"User already registered"; // Email already exists
"Password should be at least 6 characters"; // Password too short
"Invalid email"; // Email format wrong
"Unable to validate email address"; // Network issue
```

---

### Q: What does `options: { data: { username: username } }` do?

**Code:**

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      username: username, // Store username in metadata
    },
  },
});
```

**Explanation:**

Supabase automatically stores email and password, but what about extra info like username, age, or preferences?

**The `options.data` field is for custom user information.**

**Structure:**

```typescript
options: {              // Extra configuration for sign up
  data: {               // Custom data to attach to this user
    username: username, // Your custom fields go here
    // You could add: age, country, preferences, etc.
  }
}
```

**Where does it get stored?**

In the user's `user_metadata` field:

```typescript
User Object:
{
  id: "abc-123-xyz",
  email: "user@example.com",
  created_at: "2024-11-20T10:00:00Z",
  user_metadata: {
    username: "john_doe"  ← Your custom data stored here
  }
}
```

**How to retrieve it later:**

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();
const username = user.user_metadata?.username; // Get it back
```

**Property shorthand:**

```typescript
// These are the same:
username: username; // Long form
username; // Shorthand (JavaScript ES6 feature)

// Works when variable name matches property name
const obj = {
  email: email, // Can be shortened
  password: password, // Can be shortened
};

// Becomes:
const obj = { email, password };
```

**Example with more fields:**

```typescript
options: {
  data: {
    username,
    age: 25,
    country: "Canada",
    preferences: {
      theme: "dark",
      notifications: true,
      language: "en"
    },
    avatar_url: "https://example.com/avatar.jpg"
  }
}
```

**Important notes:**

- This data is NOT encrypted (don't store sensitive info like passwords)
- It's visible to the user (they can see it in their session)
- Perfect for: usernames, display names, preferences, profile info
- NOT for: passwords, credit cards, private data

---

### Q: How does logout work?

**Code:**

```typescript
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error logging out:", error.message);
  } else {
    navigate("/"); // Redirect to home page
  }
};
```

**What happens:**

1. **User clicks logout button** → `handleLogout` runs

2. **Call Supabase:** `supabase.auth.signOut()`

   - Deletes the user's session (their "login key")
   - Clears authentication cookies
   - Removes tokens from browser storage
   - Tells Supabase "this user is no longer logged in"

3. **Check for errors:** If something went wrong, log it

4. **Redirect:** Send user back to home page

**What is a "session"?**

When you log in, Supabase gives you a session (like a digital key card). This key card:

- Proves you're logged in
- Lets you access protected data
- Expires after a certain time
- Gets stored in your browser

When you log out, the key card is destroyed.

**Example of checking if someone is logged in:**

```typescript
const {
  data: { session },
} = await supabase.auth.getSession();

if (session) {
  console.log("User is logged in!");
  console.log("User ID:", session.user.id);
  console.log("Email:", session.user.email);
} else {
  console.log("User is NOT logged in");
}
```

**Complete logout with state management:**

```typescript
const handleLogout = async () => {
  setLoading(true);

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error logging out:", error.message);
    alert("Failed to log out. Please try again.");
  } else {
    // Clear any local state
    setUser(null);
    setUserEmail(null);
    setUsername(null);

    // Redirect to home
    navigate("/");
  }

  setLoading(false);
};
```

---

## React Hooks

### Q: What does `useEffect` do and what is the dependency array `[]`?

**Code:**

```typescript
useEffect(() => {
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email);
    } else {
      navigate("/signin");
    }
  };

  getUser();
}, [navigate]); // ← What is this?
```

**What is useEffect?**

`useEffect` lets you run code at specific times in your component's lifecycle:

- When component first loads (mount)
- When certain values change (update)
- When component is destroyed (unmount/cleanup)

Think of it as a way to say "do this when X happens."

**The Dependency Array - Three Options:**

### 1. No array (runs on EVERY render) ⚠️

```typescript
useEffect(() => {
  console.log("Runs on every single render!");
});
// Dangerous! Can cause infinite loops
```

**When this happens:**

- Component renders
- useEffect runs
- If useEffect changes state
- Component re-renders
- useEffect runs again
- INFINITE LOOP! 💥

### 2. Empty array `[]` (runs ONCE when component loads) ✅

```typescript
useEffect(() => {
  console.log("Runs once when page loads");
  fetchData();
}, []);
// Perfect for: fetching data, setting up subscriptions, initializing
```

**When this happens:**

- Component first mounts
- useEffect runs ONCE
- Never runs again (unless component unmounts and remounts)

### 3. Array with values `[count, user]` (runs when those values change)

```typescript
const [count, setCount] = useState(0);

useEffect(() => {
  console.log("Count changed to:", count);
  document.title = `Count: ${count}`;
}, [count]); // Re-runs every time count changes
```

**When this happens:**

- Component first mounts → useEffect runs
- `count` changes from 0 to 1 → useEffect runs
- `count` changes from 1 to 2 → useEffect runs
- Other state changes → useEffect does NOT run

**Practical Examples:**

**Example 1: Fetch user data once**

```typescript
useEffect(() => {
  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };
  fetchUser();
}, []); // Empty array = run once on mount
```

**Example 2: Update document title when name changes**

```typescript
useEffect(() => {
  document.title = `${name}'s Profile`;
}, [name]); // Runs when name changes
```

**Example 3: Search when search term changes**

```typescript
useEffect(() => {
  const searchDatabase = async () => {
    const results = await search(searchTerm);
    setResults(results);
  };

  if (searchTerm) {
    // Only search if there's a term
    searchDatabase();
  }
}, [searchTerm]); // Runs when searchTerm changes
```

**Example 4: Multiple dependencies**

```typescript
useEffect(() => {
  fetchHabits(userId, filter, sortBy);
}, [userId, filter, sortBy]); // Runs when ANY of these change
```

**Why `[navigate]` in your code?**

```typescript
}, [navigate]);
```

Technically, `navigate` never changes, so `[navigate]` and `[]` do the same thing. But ESLint (code checker) warns: "You're using `navigate` inside useEffect, so list it as a dependency."

It's a **best practice** to include all variables you use from outside the effect, even if they don't change. This prevents bugs if the code changes later.

**Comment for your code:**

```typescript
}, [navigate]);
// Runs once on page load. [navigate] keeps ESLint happy (navigate never actually changes)
```

**useEffect with cleanup:**

```typescript
useEffect(() => {
  // Set up: Subscribe to real-time updates
  const subscription = supabase
    .channel("habits")
    .on("INSERT", (payload) => {
      console.log("New habit created!", payload);
    })
    .subscribe();

  // Cleanup: Unsubscribe when component unmounts
  return () => {
    console.log("Cleaning up subscription");
    subscription.unsubscribe();
  };
}, []);
```

**When to use cleanup:**

- Subscriptions (WebSockets, Supabase real-time)
- Timers (setTimeout, setInterval)
- Event listeners (window.addEventListener)
- Animations

**Common useEffect patterns:**

**Pattern 1: Fetch data on mount**

```typescript
useEffect(() => {
  fetchData();
}, []);
```

**Pattern 2: Sync with external system**

```typescript
useEffect(() => {
  connectToWebSocket();
  return () => disconnectFromWebSocket();
}, []);
```

**Pattern 3: React to prop/state changes**

```typescript
useEffect(() => {
  if (userId) {
    loadUserData(userId);
  }
}, [userId]);
```

**Pattern 4: Debounced search**

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    search(query);
  }, 500); // Wait 500ms after user stops typing

  return () => clearTimeout(timer); // Cancel if query changes again
}, [query]);
```

---

## Conditional Rendering

### Q: What does `&&` mean in `{userEmail && <p>Welcome!</p>}`?

**Code:**

```typescript
{
  userEmail && <p className="mb-4">Welcome, {userEmail}!</p>;
}
```

**This is conditional rendering** - only show something if a condition is true.

**How `&&` works in JavaScript:**

```typescript
true && "hello"; // Returns "hello"
false && "hello"; // Returns false
null && "hello"; // Returns null
"text" && "hello"; // Returns "hello"
0 && "hello"; // Returns 0
```

**The rule:**

- If left side is **truthy** → return right side
- If left side is **falsy** → return left side (and stop)

**In React:**

```typescript
{userEmail && <p>Welcome, {userEmail}!</p>}
     ↓
  Check this first
     ↓
  Is userEmail truthy?
     ↓
  YES → Show the <p> tag
  NO  → Show nothing
```

**Real-world scenarios:**

**Scenario 1: User logged in**

```typescript
userEmail = "john@example.com";

{
  userEmail && <p>Welcome, {userEmail}!</p>;
}
// ✅ Renders: <p>Welcome, john@example.com!</p>
```

**Scenario 2: User not logged in**

```typescript
userEmail = null;

{
  userEmail && <p>Welcome, {userEmail}!</p>;
}
// ❌ Renders: nothing (React ignores null)
```

**Scenario 3: Loading state**

```typescript
userEmail = undefined; // Still fetching from database

{
  userEmail && <p>Welcome, {userEmail}!</p>;
}
// ❌ Renders: nothing yet (React ignores undefined)
```

**Why use this instead of always showing?**

**Without conditional rendering:**

```typescript
<p>Welcome, {userEmail}!</p>
```

Result while loading: `Welcome, !` ← Looks broken!

**With conditional rendering:**

```typescript
{
  userEmail && <p>Welcome, {userEmail}!</p>;
}
```

Result while loading: (nothing) ← Clean!

**Falsy vs Truthy values:**

**Falsy (won't render the component):**

```typescript
null; // No value
undefined; // Not set yet
false; // Boolean false
0; // Zero (careful with counters!)
(""); // Empty string
NaN; // Not a Number
```

**Truthy (will render the component):**

```typescript
"text"     // Any non-empty string
1          // Any non-zero number
[]         // Empty array (still truthy!)
{}         // Empty object (still truthy!)
true       // Boolean true
```

**Watch out for 0!**

```typescript
const count = 0;

{
  count && <p>Count: {count}</p>;
}
// ❌ Shows nothing! 0 is falsy

// Better:
{
  count !== undefined && <p>Count: {count}</p>;
}
// ✅ Shows: Count: 0
```

**Other ways to write conditional rendering:**

**1. Using && (shortest)**

```typescript
{
  userEmail && <p>Welcome, {userEmail}!</p>;
}
```

**2. Using ternary operator (with alternative)**

```typescript
{
  userEmail ? <p>Welcome, {userEmail}!</p> : <p>Please log in</p>;
}
```

**3. Using ternary operator (with null)**

```typescript
{
  userEmail ? <p>Welcome, {userEmail}!</p> : null;
}
```

**4. Using if statement with early return**

```typescript
if (!userEmail) return null;
return <p>Welcome, {userEmail}!</p>;
```

**5. Using variable**

```typescript
let greeting;
if (userEmail) {
  greeting = <p>Welcome, {userEmail}!</p>;
}
return <div>{greeting}</div>;
```

**Multiple conditions:**

**Show loading, then error, then content**

```typescript
{
  loading && <p>Loading...</p>;
}
{
  error && <p className="text-red-500">{error}</p>;
}
{
  !loading && !error && data && <div>{data}</div>;
}
```

**Complex condition**

```typescript
{
  isLoggedIn && hasPermission && !isBlocked && <button>Admin Panel</button>;
}
```

**Array of items**

```typescript
{
  habits.length > 0 && (
    <div>
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}

// Show message if empty
{
  habits.length === 0 && <p>No habits yet. Create one!</p>;
}
```

---

## Styling with Tailwind CSS

### Q: How do I center a div?

**Code:**

```typescript
<div className="outline outline-white flex flex-row items-center justify-center">
  <h2 className="text-3xl mb-6">Sign Up</h2>
</div>
```

**What your code does:**

- `flex` - Makes it a flexbox container
- `flex-row` - Arranges children horizontally (this is default, so optional)
- `items-center` - Centers vertically (cross-axis)
- `justify-center` - Centers horizontally (main-axis)

**Since you only have one element (the `<h2>`), you could simplify:**

**Option 1: Using flex (for any element)**

```typescript
<div className="outline outline-white flex items-center justify-center">
  <h2 className="text-3xl mb-6">Sign Up</h2>
</div>
```

**Option 2: Using text-center (for text only)**

```typescript
<div className="outline outline-white text-center">
  <h2 className="text-3xl mb-6">Sign Up</h2>
</div>
```

**When to use which:**

| Method                             | Best For                            | Example                          |
| ---------------------------------- | ----------------------------------- | -------------------------------- |
| `flex items-center justify-center` | Any element (images, buttons, divs) | Centering a card or icon         |
| `text-center`                      | Text content only                   | Centering headings or paragraphs |
| `mx-auto`                          | Block elements with width           | Centering containers             |

**Different centering scenarios:**

**1. Center a full page**

```typescript
<div className="min-h-screen flex items-center justify-center">
  <div>Content</div>
</div>
```

**2. Center horizontally only**

```typescript
<div className="flex justify-center">
  <div>Content</div>
</div>
```

**3. Center vertically only**

```typescript
<div className="min-h-screen flex items-center">
  <div>Content</div>
</div>
```

**4. Center a fixed-width div**

```typescript
<div className="w-96 mx-auto">Content</div>
```

**5. Center text inside a div**

```typescript
<div className="text-center">
  <p>Centered text</p>
</div>
```

---

### Q: What are the general rules of thumb for styling pages?

**Base Page Container:**

```typescript
<div className="min-h-screen">{/* Your content */}</div>
```

**Why:**

- `min-h-screen` ensures page takes up at least full viewport height
- Prevents awkward white space at bottom on short pages
- Allows content to grow beyond screen height if needed

**Common Page Layouts:**

### 1. Centered Content Page (Sign In, Sign Up, Landing)

```typescript
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-96 p-8">{/* Your form or content */}</div>
</div>
```

### 2. Dashboard/App Page (with header/nav)

```typescript
<div className="min-h-screen p-4 text-white">
  {/* Header/Nav at top */}
  <div className="max-w-7xl mx-auto">
    {/* Main content, centered with max width */}
  </div>
</div>
```

### 3. Full-Width Page (games, canvas, immersive)

```typescript
<div className="min-h-screen w-full">{/* Full bleed content */}</div>
```

**Key Properties Explained:**

### `min-h-screen`

- **Always use this** on your outermost page div
- Makes page at least full viewport height (100vh)
- Content can grow taller if needed
- Example: `min-h-screen` = minimum 100% of viewport height

### Padding (`p-4`, `p-8`, etc.)

- **Use on outer container** for breathing room
- `p-4` (1rem/16px) - tight spacing, mobile-friendly
- `p-8` (2rem/32px) - comfortable spacing, desktop
- Prevents content from touching screen edges
- Example: `p-4` = 16px padding on all sides

### Max Width (`max-w-7xl`, `max-w-4xl`, etc.)

- **Use for readable content** (prevents text from stretching too wide on large screens)
- `max-w-4xl` (56rem/896px) - good for articles, forms
- `max-w-7xl` (80rem/1280px) - good for dashboards
- Combine with `mx-auto` to center it
- Example: `max-w-4xl mx-auto` = max 896px width, centered

### Text Color

```typescript
<div className="text-white">{/* All children inherit white text */}</div>
```

- Set once on parent, children inherit it
- Don't repeat on every element
- Can override on specific children if needed

**My Go-To Template:**

```typescript
export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Optional: Navigation/Header */}
      <nav className="mb-8">{/* Nav content */}</nav>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl mb-8">Page Title</h1>

        {/* Your content here */}
      </div>
    </div>
  );
}
```

**Rules of Thumb:**

1. **Always start with `min-h-screen`** on the outermost div
2. **Add padding** (`p-4` or `p-8`) to prevent edge-touching
3. **Set text color once** on parent container
4. **Use `max-w-*` + `mx-auto`** for centered, readable content
5. **Use flexbox** (`flex items-center justify-center`) for centering
6. **Mobile-first**: Default styles for mobile, add `md:` prefixes for desktop

**Responsive Design:**

```typescript
<div className="p-4 md:p-8">
  {/* 16px padding on mobile, 32px on desktop */}
</div>

<div className="text-2xl md:text-4xl">
  {/* Smaller text on mobile, larger on desktop */}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>
```

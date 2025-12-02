# Atoma Habit Tracker - Development Roadmap

## 🎯 Project Vision

Build a focused, user-friendly habit tracking app that helps users build consistency through streaks, visual progress, and AI-powered insights.

---

## ✅ Phase 0: Foundation (COMPLETED)

**Status:** ✅ Done

### Completed Features:

- [x] User authentication (Sign Up, Sign In, Logout)
- [x] CRUD operations for habits (Create, Read, Update, Delete)
- [x] Daily habit completion tracking
- [x] User-specific habit filtering
- [x] Basic dashboard layout
- [x] Code refactoring (custom hooks, component separation)

### Technical Achievements:

- React + TypeScript + Vite setup
- Supabase integration (auth + database)
- Tailwind CSS styling
- Component architecture established
- Custom `useHabits` hook for data management

---

## 🔥 Phase 1: Core Experience Enhancement (CURRENT)

**Goal:** Make the app actually useful for daily habit tracking

### 1.1 Streak Tracking System

**Priority:** HIGH | **Status:** 🚧 In Progress

#### Backend Requirements:

- [ ] Create streak calculation function
  - Count consecutive days with completion logs
  - Handle timezone considerations
  - Reset on missed days
  - Today counts only if logged

#### Frontend Implementation:

- [ ] Add streak calculation to `useHabits` hook
- [ ] Update `HabitCard` component to display streaks
  - Show 🔥 fire icon
  - Display count (e.g., "12-day streak")
  - Prominent placement
- [ ] Real-time streak updates on completion
- [ ] Show "0-day streak" or "Start your streak!" for new habits

#### Database Changes:

- No schema changes needed (calculate from `habit_logs`)
- Consider adding `last_completed_date` to habits table for optimization (optional)

#### Success Criteria:

- Streaks display correctly on all habit cards
- Streaks update immediately when marking complete
- Streaks reset properly when habits are missed
- Edge cases handled (new habits, timezone changes)

---

### 1.2 Dashboard UX Redesign

**Priority:** HIGH | **Status:** 🚧 In Progress

#### Layout Restructure:

- [ ] **Today's Summary Section** (Top)

  - Current date display
  - Progress indicator (e.g., "3 of 5 habits completed")
  - Motivational message based on progress
  - Quick stats (current longest streak)

- [ ] **Today's Habits Section** (Primary Focus)

  - Filter habits by frequency (show only today's due habits)
  - Daily habits: always shown
  - Weekly habits: shown on specific days
  - Monthly habits: shown on specific dates
  - Large, clear completion checkboxes
  - Streak display on each card

- [ ] **Upcoming/Other Habits Section** (Collapsible)

  - Habits not due today
  - Collapsed by default
  - Expandable for viewing/editing

- [ ] **Quick Actions**
  - "Add Habit" button (prominent but not distracting)
  - Edit/Delete moved to overflow menu (⋮) on cards

#### Visual Improvements:

- [ ] Better visual hierarchy
- [ ] Clearer completion states
- [ ] Reduced clutter (hide secondary actions)
- [ ] Improved empty states
- [ ] Loading states with skeletons

#### Success Criteria:

- Users can immediately see what needs to be done today
- Completed vs incomplete habits are visually distinct
- Dashboard feels focused and actionable
- No cognitive overload from too many options

---

## 📊 Phase 2: Progress Visibility (NEXT)

**Goal:** Show users their progress and patterns

### 2.1 Progress Analytics Dashboard

**Priority:** MEDIUM | **Status:** 📋 Planned

#### New Page: `/analytics`

- [ ] Create Analytics page component
- [ ] Add navigation link from Dashboard

#### Weekly Completion Chart (Line Chart)

- [ ] Install chart library (Recharts recommended)
- [ ] Fetch last 7 days of completion data
- [ ] Display line chart showing daily completion counts
- [ ] Hover tooltips with details
- [ ] Responsive design

#### Monthly Completion Chart (Bar Chart)

- [ ] Fetch last 30 days of completion data
- [ ] Display bar chart showing completion rates
- [ ] Week-by-week comparison
- [ ] Responsive design

#### Key Metrics Panel

- [ ] Total completions this period
- [ ] Completion rate percentage
- [ ] Most consistent habit (highest completion rate)
- [ ] Least consistent habit (needs attention)
- [ ] Current longest streak across all habits

#### Technical Implementation:

- Create `useAnalytics` hook for data fetching
- Aggregate completion data by date
- Calculate statistics
- Format data for chart libraries

#### Success Criteria:

- Charts load quickly and display correctly
- Data is accurate and up-to-date
- Visualizations are easy to understand
- Mobile-responsive

---

### 2.2 Enhanced Habit Cards

**Priority:** LOW | **Status:** 📋 Planned

#### Additional Information:

- [ ] Last completed date
- [ ] Completion rate (last 7/30 days)
- [ ] Mini sparkline chart (optional)
- [ ] Best streak record

---

## 🤖 Phase 3: AI-Powered Insights (FUTURE)

**Goal:** Provide personalized feedback and recommendations

### 3.1 AI Insights Generator

**Priority:** MEDIUM | **Status:** 📋 Planned

#### New Page: `/insights`

- [ ] Create Insights page component
- [ ] Add navigation link

#### Backend Setup:

- [ ] Set up OpenAI API integration
- [ ] Create API endpoint for insight generation
- [ ] Design prompt template
- [ ] Aggregate user statistics for AI context

#### Frontend Implementation:

- [ ] "Generate Insight" button
- [ ] Loading state during generation
- [ ] Display 2-3 paragraphs of feedback
- [ ] Show last generated timestamp
- [ ] Error handling for API failures

#### Insight Content:

- Identify best performing habits
- Highlight habits needing attention
- Suggest habit pairing strategies
- Recognize patterns and trends
- Provide actionable recommendations

#### Technical Considerations:

- Rate limiting (prevent spam)
- Cost management (OpenAI API costs)
- Caching insights (don't regenerate too frequently)
- Graceful degradation if API fails

#### Success Criteria:

- Insights are relevant and personalized
- Feedback is actionable
- Loading states are clear
- Errors are handled gracefully

---

## 📱 Phase 4: Responsive Design Polish (ONGOING)

**Goal:** Ensure great experience across all devices

### 4.1 Responsive Breakpoints

**Priority:** HIGH | **Status:** 🚧 Ongoing

#### Target Devices:

- [ ] Desktop (1920px+)

  - Multi-column layouts
  - Expanded charts
  - Side-by-side views

- [ ] Tablet (768px - 1024px)

  - Adaptive grid layouts
  - Touch-friendly buttons
  - Optimized spacing

- [ ] Mobile (320px - 767px)
  - Single column layout
  - Bottom navigation (optional)
  - Swipe gestures (optional)
  - Large touch targets

#### Implementation:

- Use Tailwind responsive utilities (`sm:`, `md:`, `lg:`, `xl:`)
- Test on multiple viewport sizes
- Ensure touch-friendly interactions
- Optimize for mobile performance

#### Success Criteria:

- App is fully functional on all screen sizes
- No horizontal scrolling
- Touch targets are at least 44x44px
- Text is readable without zooming

---

## 🚫 Out of Scope (Do NOT Build)

To maintain realistic project scope, the following features are explicitly excluded:

- ❌ Social features or community
- ❌ Habit sharing or templates
- ❌ Push notifications or reminders
- ❌ Native mobile app
- ❌ Complex ML models
- ❌ Scheduling or calendar integration
- ❌ Offline mode
- ❌ Payment or premium tiers
- ❌ Team or collaborative features
- ❌ Habit categories or tags (keep it simple)
- ❌ Custom themes or appearance settings
- ❌ Export/import functionality
- ❌ Third-party integrations

---

## 🗄️ Database Schema Updates

### Current Schema:

```sql
-- users (handled by Supabase Auth)

-- habits
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily',
  created_at TIMESTAMP DEFAULT NOW()
);

-- habit_logs
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  completed_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);
```

### Potential Future Additions:

- `last_completed_date` on habits table (optimization)
- `best_streak` on habits table (tracking record)
- `insights` table for caching AI-generated insights

---

## 📈 Success Metrics

### User Engagement:

- Daily active users
- Average habits per user
- Average completion rate
- Streak retention (users maintaining 7+ day streaks)

### Technical Performance:

- Page load time < 2 seconds
- API response time < 500ms
- Zero critical bugs
- 95%+ uptime

### User Experience:

- Intuitive navigation (no user confusion)
- Clear visual feedback on all actions
- Mobile-friendly interactions
- Accessible to all users

---

## 🛠️ Technical Stack

### Frontend:

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Charts:** Recharts (to be added)
- **State Management:** React hooks + custom hooks

### Backend:

- **Platform:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime (optional)

### AI Integration:

- **Provider:** OpenAI API
- **Model:** GPT-3.5-turbo or GPT-4
- **Implementation:** Simple prompt engineering

### Development Tools:

- **Version Control:** Git
- **Package Manager:** npm
- **Linting:** ESLint
- **Formatting:** Prettier (if configured)

---

## 🎯 Current Sprint Focus

### Sprint 1: Streaks + Dashboard Redesign

**Duration:** Current sprint
**Goal:** Make the app feel useful and motivating

#### Tasks:

1. Implement streak calculation logic
2. Update HabitCard to show streaks
3. Redesign Dashboard layout (today-focused)
4. Add progress summary section
5. Filter habits by frequency/due date
6. Test and refine UX

#### Definition of Done:

- Streaks display correctly and update in real-time
- Dashboard clearly shows today's tasks
- Users can quickly see progress
- Code is clean and maintainable
- No regressions in existing features

---

## 📝 Notes & Decisions

### Design Principles:

1. **Simplicity First:** Avoid feature bloat
2. **Clarity Over Complexity:** Simple metrics > statistical accuracy
3. **Mobile-First:** Design for smallest screen first
4. **Instant Feedback:** Real-time updates on all actions
5. **Motivation-Driven:** Use streaks and progress to encourage consistency

### Technical Decisions:

- Using Supabase for rapid development
- Custom hooks for data management (not Redux/Zustand)
- Component-based architecture for maintainability
- Tailwind for consistent styling
- TypeScript for type safety

### Future Considerations:

- Consider adding habit categories (later)
- Explore habit templates (later)
- Investigate reminder system (much later)
- Evaluate need for offline support (probably not needed)

---

## 🚀 Getting Started (For New Developers)

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase project and add credentials to `.env.local`
4. Run development server: `npm run dev`
5. Check `progress.md` for current status
6. Review this roadmap for upcoming features
7. Pick a task from current sprint and start coding!

---

**Last Updated:** November 28, 2025
**Current Phase:** Phase 1 - Core Experience Enhancement
**Next Milestone:** Streak Tracking + Dashboard Redesign Complete

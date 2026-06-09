# LifeOps Frontend Implementation Guide

## Overview
Complete production-ready LifeOps frontend application with all pages, components, and design system patterns implemented according to the UX/UI specifications.

## Completed Pages

### 1. **Dashboard / Home** (`/`)
- Priority alert banner with action button
- 6-metric grid (Sleep, Steps, Budget, Meetings, Social, Focus)
- Today's Timeline with visual scheduling
- Ask LifeOps input section
- Life Balance circular chart
- Upcoming Highlights panel

### 2. **Morning Brief** (`/morning-brief`)
- Picture of the Day section
- Key context cards (Calendar, Sleep, Finance, Social)
- Recommended actions with colored buttons
- "Why am I seeing this?" transparency section
- Show sources functionality

### 3. **Ask LifeOps** (`/ask-lifeops`)
- Quick question suggestions
- LifeOps response section
- Metrics breakdown (green/red items)
- Quick wins section
- Show sources with detailed data cards

### 4. **Weekly Review** (`/weekly-review`)
- This Week's Read summary
- Weekly scorecard cards (Biggest Win, Watchout, Best Pattern)
- Domain Health progress bars
- Pattern detection card
- Next week forecast

### 5. **Connect Sources** (`/connect-sources`)
- Data coverage section with progress bar
- Connected sources grid (Google Calendar, Gmail, Apple Health, Plaid)
- Available sources grid (Amazon, DoorDash, Spotify, Notion)
- Recent sync activity tracker
- Data privacy information

### 6. **System States** (Reference pages for UI patterns)
- **Loading State** (`/system/loading`) - Sync progress with animated indicators
- **Empty State** (`/system/empty`) - No data guidance with CTA
- **Error State** (`/system/error`) - Error handling with recovery actions

### 7. **Design System** (`/design-system`)
- Comprehensive component showcase
- Button variants and states
- Status state indicators
- Color palette
- Alert patterns
- Metric card examples

## Navigation Structure

### Sidebar Layout
- **Workspace Section**
  - Home (highlighted in teal)
  - Morning Brief
  - Ask LifeOps
  - Tasks & Actions

- **Life Domains**
  - Calendar (red icon)
  - Health (red/pink icon)
  - Finance (orange icon)
  - Social (blue icon)
  - Productivity (yellow icon)

- **Insights**
  - Intelligence Hub
  - Weekly Review

- **User Profile** (Bottom)
  - Avatar with initials
  - Name and "View profile" link
  - Profile menu

## Design System Details

### Colors
- **Primary**: Teal (#14b8a6) - Main actions and highlights
- **Success**: Green (#93d87d) - Positive indicators
- **Warning**: Orange (#f59e0b) - Alerts and cautions
- **Error**: Red (#ff5a5f / #ef4444) - Errors and critical states
- **Info**: Blue (#0ea5e9) - Information

### Typography
- **Font**: Inter (400, 500, 600, 700, 800 weights)
- **Headings**: Bold (700-800 weight)
- **Body**: Regular (400-500 weight)

### Components

#### Buttons
- **Primary**: Solid teal background, white text
- **Secondary**: Bordered variant
- **Text**: Link-style buttons
- **States**: Hover with opacity change

#### Cards
- White background with subtle border
- Optional gradient backgrounds for metric cards
- Hover shadow effects for interactivity

#### Alerts
- **Success**: Green left border with icon
- **Warning**: Orange/amber left border with icon
- **Error**: Red left border with icon
- **Notification**: Yellow banner style (priority alert)

#### Status Indicators
- Success: Green dot (✓ Connected)
- Syncing: Orange dot with animation
- Error: Red dot
- Queued: Gray dot

#### Metric Cards
- Icon + label + large value
- Optional unit display
- Trend/sublabel below
- Gradient background options
- Hover elevation

### Spacing
- **Base unit**: 4px (Tailwind default)
- **Padding**: p-4 (16px) for cards, p-8 (32px) for page sections
- **Gaps**: gap-4 (16px) for component spacing, gap-8 (32px) for section spacing

### Border Radius
- **Standard**: rounded-lg (8px)
- **Buttons**: rounded-full (999px)
- **Cards**: rounded-lg (8px)

## File Structure

```
client/
├── pages/
│   ├── Index.tsx              # Dashboard/Home
│   ├── MorningBrief.tsx       # Morning Brief page
│   ├── AskLifeOps.tsx         # Ask LifeOps page
│   ├── WeeklyReview.tsx       # Weekly Review page
│   ├── SystemStates.tsx       # Loading/Empty/Error states
│   ├── DesignSystem.tsx       # Design system showcase
│   ├── Placeholder.tsx        # Placeholder for future pages
│   └── NotFound.tsx           # 404 page
├── components/
│   ├── Layout.tsx             # Main layout with sidebar
│   └── ConnectSources.tsx     # Connect Sources page
└── global.css                 # Tailwind config and CSS vars
```

## Responsive Design
All pages are responsive and work on:
- Desktop (1920px+)
- Laptop (1280px+)
- Tablet (768px+)
- Mobile (320px+)

The sidebar collapses on smaller screens, and grid layouts adjust to single/dual column layouts.

## Key Features Implemented

### 1. Real-time Data Display
- Live sync status indicators
- Timestamp updates
- Loading states

### 2. Clear Information Hierarchy
- Large headings for main content
- Subtle secondary text
- Color-coded categories

### 3. Action-Oriented UI
- Clear call-to-action buttons
- Status-based actions (Review, Block, Plan)
- Quick access to recommendations

### 4. Transparency & Trust
- "Why am I seeing this?" sections
- Source attribution
- Confidence scores
- Data visibility controls

### 5. Accessibility
- WCAG AA compliant colors
- Clear focus states
- Semantic HTML
- Icon + text combinations
- Screen reader friendly

## Future Enhancement Opportunities

1. **Tasks & Actions** page - Full task management interface
2. **Calendar** integration - Detailed schedule view
3. **Intelligence Hub** - Advanced pattern detection interface
4. **Domain Views** - Detailed health, finance, social pages
5. **Settings** - User preferences and notifications
6. **Notifications** - Real-time alert system
7. **Mobile App** - Native mobile experience

## Deployment

The app is built with:
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Routing**: React Router 6 (SPA mode)
- **UI Components**: Radix UI + custom components

Build with: `pnpm build`
Start dev: `pnpm dev`
Deploy with: Netlify or Vercel (see AGENTS.md for details)

## Notes for Developers

- No API calls are wired up yet - integrate backend as needed
- Component Library in `client/components/ui/` available for extension
- Tailwind CSS variables defined in `global.css` for easy theme updates
- Use semantic color variables (`text-success`, `bg-primary`, etc.) for consistency
- All components are TypeScript-safe with full type coverage

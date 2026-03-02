# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

**Development:**
- `npm run dev` - Start Vite dev server (http://localhost:5173)
- `npm run preview` - Preview production build locally

**Build:**
- `npm run build` - Full production build with TypeScript type checking (recommended)
- `npm run build:fast` - Fast build without type checking (for quick testing)
- `npm run type-check` - Run TypeScript type checking only

**Linting:**
- `npm run lint` - Run ESLint (flat config, TypeScript ESLint 8)

**Testing:**
- `npm run test` - Run Vitest unit tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Playwright E2E tests

**Supabase:**
- `npm run supabase:types` - Generate TypeScript types from local Supabase instance
- For remote: `npx supabase gen types typescript --project-id <project-ref> > src/types/database.ts`

## Architecture Overview

### State Management Pattern

The app uses a **Context + Custom Hooks** pattern:

1. **AuthContext** (`src/context/AuthContext.tsx`) - Manages authentication state
2. **HabitsContext** (`src/context/HabitsContext.tsx`) - Manages habits/cards/history state
3. **Custom Hooks** (`src/hooks/`):
   - `useHabits.ts` - CRUD operations for habits (memoized with `useMemo`)
   - `useHistory.ts` - Punches, unpunches, undo logic (memoized with `useMemo`)
   - `useAsyncAction.ts` - Reusable async operation handler with loading/error state

**Key Pattern:** Hooks return memoized objects to prevent unnecessary re-renders. Components use `useAsyncAction` for consistent loading/error handling.

### UI Component Library

Reusable UI primitives in `src/components/ui/`:

| Component | Purpose |
|-----------|---------|
| `Button` | Styled button with variants (primary/secondary/danger), sizes, loading state |
| `Modal` | Accessible modal with focus trap, Escape to close, click-outside-to-close |
| `Icon` | SVG icon component with named icons (check, edit, trash, undo, etc.) |
| `LoadingSpinner` | Consistent loading indicator with optional message |
| `ErrorMessage` | Error display (inline or block variants) |

Import via: `import { Button, Modal, Icon } from './ui'`

### Error Handling

- **ErrorBoundary** wraps the entire app for graceful error recovery
- **useAsyncAction** hook provides consistent try/catch/finally pattern:
  ```typescript
  const { execute, loading, error } = useAsyncAction(async () => {
    await someOperation();
  });
  ```

### Real-time Updates

HabitsContext subscribes to Supabase real-time changes on the `history` table. Any change triggers a full refresh of habits, cards, and history to keep all clients synchronized.

### Undo System Architecture

Event-sourced using the `history` table:

- `event_type`: 'punch' | 'habit_create' | 'habit_edit' | 'habit_delete'
- `event_data`: JSONB containing event-specific data for restoration
- Punches ARE history entries (event_type='punch')

**Undo Logic** (`useHistory.ts`):
- `punch` → Delete the punch record
- `habit_create` → Delete the habit (cascades)
- `habit_edit` → Restore old name from event_data
- `habit_delete` → Re-insert habit, cards, and punches from event_data snapshot

### Card Completion Flow

When the 10th punch is added:
1. Mark current card as `is_current: false` with `completed_at` timestamp
2. Create new card with `is_current: true`
3. Database constraint ensures only one current card per habit

### Database Design

**Tables:** `profiles`, `habits`, `cards`, `history`

**Key Constraints:**
- Unique index: Only one `is_current=true` card per habit
- Row Level Security (RLS) on all tables
- CASCADE deletes from habit → cards → history

**Trigger:** `create_first_card_for_habit()` auto-creates first card on habit insert

### Type Safety

- Supabase-generated types in `src/types/database.ts`
- Domain types extend database types: `HabitWithCard`, `PunchResult`
- Path alias `@/` maps to `src/`

### Component Structure

```
App.tsx
└── ErrorBoundary
    └── AuthProvider
        └── AuthGuard (shows LoginPage if not authenticated)
            └── HabitsProvider
                ├── Header
                ├── AddHabitForm
                ├── HabitList
                │   └── HabitCard[]
                │       └── PunchCard
                │           └── PunchSlot[10]
                ├── HistoryView
                └── UndoButton (floating)
```

## Key Constants

Located in `src/utils/constants.ts`:

| Constant | Value | Purpose |
|----------|-------|---------|
| `PUNCHES_PER_CARD` | 10 | Slots per punch card |
| `HISTORY_DISPLAY_LIMIT` | 20 | Max items in history view |
| `DEFAULT_HISTORY_FETCH_LIMIT` | 100 | Default fetch limit for history |
| `CELEBRATION_DURATION_MS` | 3000 | Card completion animation duration |
| `HABIT_NAME_MAX_LENGTH` | 100 | Max characters for habit name |

## Environment Setup

Create `.env.local` with Supabase credentials:
```
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Color Palette

**STRICT RULE:** Only use colors from this 32-color palette. Never use Tailwind default colors (gray-*, red-*, etc.) or arbitrary hex values outside this set.

```
#bc8b96 #974b72 #7f305c #5d2047 #46173a #340d31 #200816
#312234 #40364a #5b596d #7c8497 #9daec0 #f8e6d0 #dcbaa0
#c08e70 #946452 #683a34 #442125 #732f31 #a23c3c #b45e4e
#cf8c52 #e8c988 #a3ab6d #5e8c51 #436852 #3e4350 #381d4e
#3c2c6a #444c84 #5c79a6 #8bc0ca
```

### Tailwind Color Tokens (in `tailwind.config.js`)

| Token | Hex | Usage |
|-------|-----|-------|
| `ui.bg` | `#3e4350` | Page background |
| `ui.surface` | `#312234` | Header, form wrappers |
| `ui.raised` | `#40364a` | Inputs, secondary buttons |
| `ui.border` | `#5b596d` | Borders |
| `ui.muted` | `#7c8497` | De-emphasized text on dark bg |
| `ui.secondary` | `#9daec0` | Secondary text on dark bg |
| `ui.primary` | `#f8e6d0` | Primary text on dark bg |
| `modal.bg` | `#f8e6d0` | Modal background (light) |
| `modal.text` | `#3e4350` | Modal text (dark on light) |
| `modal.hover` | `#dcbaa0` | Modal hover/row backgrounds |
| `modal.muted` | `#5b596d` | De-emphasized text in modals |
| `punch.primary` | `#5c79a6` | Punch accent color |
| `punch.hover` | `#8bc0ca` | Punch hover state |
| `punch.success` | `#5e8c51` | Success/completion |
| `danger` | `#a23c3c` | Destructive actions |
| `danger.hover` | `#b45e4e` | Destructive hover |

### Modal Color Scheme

Modals use a **light background** (`#f8e6d0`) with **dark text** (`#3e4350`). This is the inverse of the main app. Inside modals:
- Use `text-modal-text`, `text-modal-muted` instead of `text-ui-primary`, `text-ui-secondary`
- Use `bg-modal-hover` for row backgrounds instead of `bg-ui-raised`
- The `Modal` component sets `color: #3e4350` via inline style so children inherit dark text by default

### Pixel Art & Font

- All images use `image-rendering: pixelated` (`.pixelated` class)
- Font: FSPixelSans (`src/assets/fonts/`) used globally at minimum 2rem
- Integer-only scaling for pixel art (ResizeObserver in PunchCard.tsx)
- `@font-face` metric overrides fix vertical centering: `ascent-override: 70%; descent-override: 30%`

## Testing

**Unit Tests:** `src/**/*.test.ts` - Vitest + Testing Library
**E2E Tests:** `tests/` directory - Playwright

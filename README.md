# Pixel Punch Card

A habit tracking web app using a punch card metaphor. Users track habits by "punching" cards (10 slots each). Built with React 18, TypeScript, Vite, Tailwind CSS, and Supabase (PostgreSQL BaaS) with Google OAuth.

## Features

- **Punch Card Tracking**: Complete 10 punches to finish a card
- **Multiple Habits**: Track unlimited habits simultaneously
- **Undo System**: Undo any action (punches, habit creation/edit/delete)
- **Real-time Sync**: Changes sync across devices using Supabase real-time
- **History View**: See all your recent activity
- **Google OAuth**: Secure authentication via Supabase
- **Timezone Support**: Accurate punch times for traveling users

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom animations
- **Backend**: Supabase (PostgreSQL with Row Level Security)
- **Auth**: Supabase Auth with Google OAuth
- **Testing**: Vitest (unit), Playwright (E2E)
- **Linting**: ESLint 9 with flat config, TypeScript ESLint 8

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- Google Cloud Console account (for OAuth)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `supabase-setup.sql`
3. Enable Google OAuth:
   - Go to Authentication → Providers → Google
   - Enable Google provider
   - Add your Google OAuth credentials (from Google Cloud Console)
   - Add authorized redirect URLs:
     - `http://localhost:5173` (for development)
     - Your production URL (when deploying)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   - Go to your Supabase project settings
   - Find "Project URL" and "anon public" API key
   - Add them to `.env.local`

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: Add your Supabase callback URL
     (found in Supabase → Authentication → Providers → Google)
5. Copy Client ID and Client Secret to Supabase Google provider settings

### 5. (Optional but Recommended) Generate TypeScript Types

For full type safety, generate types from your Supabase instance:

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
```

Replace `<your-project-ref>` with your Supabase project reference ID.

See `SUPABASE_TYPES.md` for detailed instructions.

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` and sign in with Google!

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (with full type checking) ⭐ Recommended
- `npm run build:fast` - Fast build without type checking (use for quick testing)
- `npm run type-check` - Run TypeScript type checking only
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:ui` - Run unit tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests with Playwright

## Project Structure

```
pixel-punch-card/
├── src/
│   ├── components/         # React components
│   ├── context/           # React contexts (Auth, Habits)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Supabase client
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── tests/                 # E2E tests
├── supabase-setup.sql     # Database schema
└── package.json
```

## How It Works

### Punch Card System

1. Each habit has a current card with 10 slots
2. Click an empty slot to punch it
3. Complete 10 punches to finish the card
4. A new card is automatically created
5. Click a filled slot to unpunch it

### Undo System

- All actions (punches, habit operations) are recorded in the history table
- Click the Undo button to reverse the last action
- Punch undos remove the punch
- Habit creation undo deletes the habit
- Habit edit undo restores the old name
- Habit delete undo restores everything (habit, cards, punches)

### Database Design

The app uses a single `history` table for both punches and audit trail:
- Punches ARE history entries (event_type='punch')
- Querying history shows when you punched each card
- Other events (habit_create, habit_edit, habit_delete) are also tracked
- Undo finds the most recent entry and reverses it

## Deployment

### Deploy to Vercel/Netlify

1. Push your code to GitHub
2. Connect your repository to Vercel or Netlify
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!
5. Update Supabase Google OAuth redirect URLs with your production URL

### Update Supabase Settings

After deploying, add your production URL to:
- Supabase → Authentication → URL Configuration → Site URL
- Supabase → Authentication → URL Configuration → Redirect URLs
- Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs

## Testing

### Unit Tests

```bash
npm run test
```

Unit tests use Vitest and Testing Library to test:
- Utility functions (validation, timezone)
- Custom hooks (with mocked Supabase)
- Component logic

### E2E Tests

```bash
npm run test:e2e
```

E2E tests use Playwright to test:
- Authentication flow
- Habit CRUD operations
- Punching and card completion
- Undo functionality

## Contributing

This is a personal project, but feel free to fork and customize!

## License

MIT

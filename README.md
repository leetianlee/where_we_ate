# Where We Ate - Family Restaurant Tracker

A collaborative web app for families to track their restaurant experiences, ratings, and spending together.

## Features

- **Family Groups**: Create a family group and invite members with a simple invite code
- **Collaborative Tracking**: Everyone can add restaurants and log visits
- **Real-time Sync**: Changes sync instantly across all family members' devices
- **Rich Visit Logs**: Track ratings, dishes, prices, and recommendations
- **Search & Filter**: Find restaurants by name, cuisine, or rating

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Deployment**: Vercel

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/where-we-ate.git
cd where-we-ate
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase/schema.sql`
3. Go to **Authentication > URL Configuration** and add your site URL
4. Copy your project credentials from **Settings > API**

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel

### Option 1: Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/where-we-ate)

### Option 2: Manual Deploy

1. Push your code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/where-we-ate.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)

4. Deploy!

### Post-Deployment

1. Update Supabase **Authentication > URL Configuration**:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

2. Update `NEXT_PUBLIC_APP_URL` in Vercel to your production URL

## Database Schema

The app uses the following main tables:

- **profiles**: User profiles (auto-created on signup)
- **families**: Family groups with invite codes
- **family_members**: Junction table linking users to families
- **restaurants**: Restaurant entries owned by families
- **visits**: Visit logs with ratings and details
- **dishes**: Individual dishes ordered during visits
- **visit_attendees**: Track who attended each visit

See `supabase/schema.sql` for the complete schema with Row Level Security policies.

## Usage

### Creating a Family

1. Sign up for an account
2. Click "Create Family" and give it a name
3. Share the invite code with family members

### Joining a Family

1. Sign up (or sign in)
2. Enter the invite code shared by a family member
3. Start contributing to the shared restaurant list!

### Adding Restaurants

1. Click "Add Restaurant"
2. Enter name, cuisine type, address, etc.
3. The restaurant is now visible to all family members

### Logging Visits

1. Open a restaurant
2. Click "Log New Visit"
3. Add date, rating, dishes, bill, and notes
4. Select which family members attended

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Main app pages
│   │   └── page.tsx            # Landing page
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── family/             # Family-related components
│   │   └── restaurants/        # Restaurant components
│   ├── lib/                    # Utilities and config
│   │   └── supabase/           # Supabase client setup
│   └── types/                  # TypeScript types
├── supabase/
│   └── schema.sql              # Database schema
└── public/                     # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

---

Made with ❤️ for families who love eating out together!

# JobBoard — Modern Job Posting Platform

A full-stack web application connecting **recruiters** and **job seekers**. Built with Next.js 16, TypeScript, Tailwind CSS, and Supabase.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ecf8e?logo=supabase)

---

## 🎯 Features

### For Job Seekers
- 🔍 Browse active job listings with search and category filters
- 💼 View detailed job descriptions, requirements, and benefits
- 📮 Apply for jobs with optional cover letter
- ❤️ Save/bookmark favourite jobs
- 📊 Track application status (Pending → Reviewed → Accepted/Rejected)
- 🔐 Secure authentication with role-based access

### For Recruiters
- 📋 Post new job listings with full details
- ✏️ Manage job postings (activate / close)
- 📬 View application counts per job
- 📊 Dashboard with real-time statistics
- 🔐 Role-protected recruiter area

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Auth** | Supabase Auth (Email/Password) |
| **Security** | Row Level Security (RLS) policies |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```
job_board/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (font, metadata)
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles & animations
│   ├── loading.tsx               # Root loading state
│   ├── error.tsx                 # Error boundary
│   ├── not-found.tsx             # 404 page
│   ├── auth/
│   │   ├── layout.tsx            # Auth layout (centered)
│   │   ├── login/page.tsx        # Login form
│   │   └── signup/page.tsx       # Signup form with role selection
│   ├── recruiter/
│   │   ├── layout.tsx            # Recruiter layout + auth guard
│   │   ├── dashboard/page.tsx    # Stats & recent jobs
│   │   └── jobs/
│   │       ├── page.tsx          # Job listings management
│   │       └── create/page.tsx   # Create new job form
│   └── seeker/
│       ├── layout.tsx            # Seeker layout + auth guard
│       ├── dashboard/page.tsx    # Stats & recent applications
│       ├── jobs/
│       │   ├── page.tsx          # Browse jobs with filters
│       │   └── [id]/page.tsx     # Job detail + apply modal
│       └── applications/page.tsx # Track applications
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── Badge.tsx             # Status badges
│   │   ├── Button.tsx            # Button with variants
│   │   ├── Card.tsx              # Card layout
│   │   ├── Input.tsx             # Input, Textarea, Select
│   │   └── Modal.tsx             # Modal dialog
│   ├── layout/
│   │   └── Navbar.tsx            # Responsive navigation
│   └── jobs/
│       ├── JobCard.tsx           # Job listing card
│       └── StatsCard.tsx         # Dashboard stat card
├── lib/
│   ├── supabase.ts               # Supabase client
│   └── types.ts                  # TypeScript interfaces
├── supabase-schema.sql           # Database schema + RLS
├── tailwind.config.js            # Tailwind configuration
├── next.config.ts                # Next.js configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.9+ 
- npm or pnpm
- A [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd job_board
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from your Supabase project → Settings → API.

### 4. Set up the database

1. Go to your Supabase Dashboard → **SQL Editor**
2. Copy the contents of `supabase-schema.sql`
3. Paste and run it — this creates all tables and RLS policies

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles linked to auth.users (role, name, email) |
| `jobs` | Job postings by recruiters (title, description, salary, etc.) |
| `applications` | Job applications by seekers (cover letter, status) |
| `saved_jobs` | Bookmarked jobs by seekers |

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only modify their own data
- Recruiters can only manage their own jobs
- Seekers can only view/manage their own applications and saved jobs
- Recruiters can view and update status of applications on their jobs

---

## 🎨 Design System

- **Theme**: Dark mode with slate color palette
- **Accent**: Blue-to-cyan gradient (`from-blue-500 to-cyan-500`)
- **Typography**: Inter font family
- **Animations**: CSS-based fade-in, slide-down, pulse-glow
- **Components**: Reusable Button, Card, Badge, Input, Modal, Navbar

---

## 📦 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

---

## 📄 License

This project is for educational purposes.

# Blog App

A modern Blog application built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- React with TypeScript for type safety
- Tailwind CSS for styling
- Supabase for backend services
- Modern UI components with Headless UI
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── hooks/         # Custom React hooks
  ├── types/         # TypeScript type definitions
  ├── utils/         # Utility functions
  └── lib/           # Library configurations (Supabase, etc.)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run the following SQL in your Supabase SQL editor to set up the database schema:

```sql
-- Enable Row Level Security
alter table auth.users enable row level security;

-- Create documents table
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  status text not null check (status in ('draft', 'pending_review', 'approved', 'rejected')),
  visibility text not null check (visibility in ('private', 'public')),
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewer_feedback text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone
);

-- Enable RLS on documents
alter table public.documents enable row level security;

-- Create policies
create policy "Users can view their own documents"
  on documents for select
  using (auth.uid() = created_by);

create policy "Users can view public documents"
  on documents for select
  using (visibility = 'public');

create policy "Creators can insert their own documents"
  on documents for insert
  with check (
    auth.uid() = created_by
    and auth.jwt() ->> 'role' = 'creator'
  );

create policy "Creators can update their own documents"
  on documents for update
  using (
    auth.uid() = created_by
    and auth.jwt() ->> 'role' = 'creator'
  );

create policy "Reviewers can update documents they are reviewing"
  on documents for update
  using (
    auth.jwt() ->> 'role' = 'reviewer'
    and status = 'pending_review'
  );

-- Create function to handle user role
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Set default role as 'creator'
  update auth.users
  set raw_user_meta_data = jsonb_set(
    coalesce(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"creator"'
  )
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

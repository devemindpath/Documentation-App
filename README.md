# Documentation App

A modern documentation application built with React, TypeScript, Tailwind CSS, and Supabase.

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

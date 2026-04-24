# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestProtect is a disaster preparedness and recovery guidance application built with React, TypeScript, and Vite. It helps users prepare for, respond to, and recover from natural disasters through hazard-specific checklists, resources, and risk assessments based on ZIP code location.

The app is maintained through Lovable (https://lovable.dev) with two-way GitHub sync.

## Tech Stack

- Vite + React 18.3.1 + TypeScript 5.8.3
- shadcn/ui + Tailwind CSS 3.4.17
- React Router DOM v6 (routing)
- React Context + TanStack React Query v5 (state)
- Supabase (auth + PostgreSQL database)
- Vercel Analytics

## Development Commands

npm install - Install dependencies
npm run dev - Start dev server (localhost:8080)
npm run build - Production build
npm run build:dev - Dev build with sourcemaps
npm run preview - Preview production build
npm run lint - Lint TypeScript and JSX

## Architecture Overview

The app uses a component-based architecture:
- src/components/ - Page components and reusable UI
- src/pages/ - Static pages (Terms, Privacy, About, Auth)
- src/hooks/ - Custom hooks (auth, location, profile, toast)
- src/integrations/supabase/ - Backend service integration
- src/utils/ - Helper functions (security, device ID, validation)
- src/lib/ - Utilities (cn() for Tailwind merging)

## Core Architecture Patterns

**Authentication & Authorization**
- AuthProvider.tsx: Context-based state using Supabase
- useAuth() hook: Exposes user, session, guest mode state
- ProtectedRoute.tsx: Wraps protected content, redirects to auth unless guest
- Supports both authenticated and guest access

**Routing**
- App.tsx: Central route definitions with React Router
- AppRouter.tsx: Determines auth page vs homepage based on user state
- Public routes: /, /auth, /terms, /privacy, /about
- Protected routes: /preparedness, /during, /act, /after, /recovery-checklist, /googlesearch, /settings, /self-assessment, /shortcut, /kid, etc.

**Data Access**
- Supabase client: integrations/supabase/client.ts
- Real-time subscriptions: useUserProfile.ts watches profile changes
- RPC functions: ZIP code validation, device ID generation
- Tables: profiles, user_preparedness_progress, tasks, recovery checklists

**Component Organization**
- Pages: PreparednessPage.tsx, ActPage.tsx, RecoveryIndexPage.tsx, Homepage.tsx
- Forms: AuthPage.tsx, ProfilePage.tsx, ReviewForm.tsx
- Shared: MobileNavigation.tsx, UI components in components/ui/

**Custom Hooks**
- useAuth(): User state and auth methods
- useUserProfile(): Profile data with real-time updates
- useUserLocation(): User ZIP code from profile
- useToast(): Sonner notifications
- useMobile(): Device responsiveness

## Data Models

- profiles: user_id, zip_code, timestamps
- user_preparedness_progress: task_id, completed status
- Preparedness tasks: hazard-specific flags (earthquake, wildfire, hurricane, etc.)
- Recovery checklists: post-disaster guidance

## Key Implementation Details

**ZIP Code Handling**
- Stored in user profile, filters hazard-specific content
- validateZipCode() validates format (5 digits or 5+4)
- Server RPC is_valid_zip_code for validation
- Tasks tagged with flags for relevant hazards

**Real-Time Updates**
- Supabase channels notify on profile/progress changes
- UI updates without page reload via useUserProfile subscriptions

**Security**
- Supabase localStorage persistence with autoRefreshToken
- Cryptographically secure device ID generation
- ZIP code sanitization
- Client-side rate limiting helper

**Guest Mode**
- Allows exploration without auth
- Protected routes deny access unless isGuest=true
- Disables when user authenticates

## Common Tasks

**Add New Page**
1. Create src/components/PageName.tsx
2. Add route in App.tsx with <ProtectedRoute> wrapper if needed
3. Add nav link in Homepage.tsx or MobileNavigation.tsx

**Connect to Supabase**
import { supabase } from '@/integrations/supabase/client'
supabase.from('table').select('*').eq('field', value)

**Add UI Components**
Use shadcn-ui CLI or copy from components/ui/
Merge Tailwind classes: cn(baseClass, conditionalClass)

**Style Components**
Tailwind classes directly
Colors: text-primary, bg-secondary (CSS variables)
Dark mode: dark: prefix

## Deployment

Hosted on Vercel. Auto-deploys on push to `main` on GitHub (https://github.com/schnabs27/nestprotect).

## Important Notes

- Supabase publishable keys in .env are safe for client code
- Protected routes require <ProtectedRoute> unless public
- Both auth and guest modes must work
- Mobile responsiveness critical (use useMobile() hook)
- ZIP code is primary location identifier

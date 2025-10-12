# Copilot Instructions for TicketWise

## Project Overview
- **Frameworks:** Next.js (App Router), React, Tailwind CSS, ShadCN UI
- **Backend:** Firebase (Firestore/Auth/Storage), with migration and dual-support for Supabase
- **Purpose:** Event ticket sales/management, including user auth, role-based dashboards, payment verification, and QR code ticketing

## Architecture & Patterns
- **App Structure:**
  - `src/app/`: Next.js app directory (routes, layouts, API endpoints)
  - `src/components/`: UI and logic components, organized by feature (e.g., `admin/`, `dashboard/`, `ui/`)
  - `src/lib/`: Core logic (database, Firebase/Supabase clients, error handling, utilities)
  - `src/types/`: Centralized TypeScript types
  - `public/`: Static assets (images, HTML templates)
- **Data Flow:**
  - User actions (purchase, login, scan) go through Next.js API routes (`src/app/api/`), which call Firestore or Supabase via `src/lib/`
  - Admin/user dashboards are separated in `src/app/dashboard/`
  - Example: Validator dashboard (`src/app/dashboard/validator/page.tsx`) fetches and updates orders, creates tickets, and updates status atomically
- **Authentication:**
  - Firebase Auth (Email/Password)
  - Auth context in `src/context/auth-context.tsx`
- **Role Management:**
  - User roles (admin, organizer, validator, user) checked in API routes and UI components
  - Role-based dashboard routing in `src/app/dashboard/`

## Developer Workflows
- **Install:** `npm install`
- **Run Dev Server:** `npm run dev` (default: http://localhost:9002)
- **Test:** Playwright tests in `tests/`, config in `playwright.config.ts`
- **Firebase Config:** Update `src/lib/firebase.ts` with your Firebase credentials
- **CORS:** Use `cors.json` and Google Cloud CLI to set CORS for Storage
- **Data Migration:** Scripts in root (e.g., `firebase-to-supabase.js`, `import-firebase-users.cjs`)

## Project Conventions
- **Component Organization:**
  - Feature-based folders in `src/components/` (e.g., `admin/`, `dashboard/`, `ui/`)
  - UI primitives in `src/components/ui/`
- **API Routes:**
  - Grouped by resource in `src/app/api/` (e.g., `auth/`, `orders/`, `tickets/`)
  - Use named folders for logical separation
- **Styling:**
  - Tailwind CSS config in `tailwind.config.ts` and `src/tailwind.config.ts`
- **Type Safety:**
  - Centralized types in `src/types/`
- **Error Handling:**
  - Centralized in `src/lib/errors.ts` and `src/lib/error-emitter.ts`

## Integration Points
- **Firebase:**
  - Auth, Firestore, Storage (see `src/lib/firebase.ts`)
- **Supabase:**
  - Dual-support and migration scripts (`src/lib/supabaseClient.ts`, `firebase-to-supabase.js`)
- **Playwright:**
  - E2E tests in `tests/`, results in `test-results/`

## Examples
- **Add a new API route:** Create a folder in `src/app/api/` and add an `index.ts` or `[id].ts` file
- **Add a dashboard page:** Add a folder in `src/app/dashboard/` and a `page.tsx` file
- **Add a UI component:** Place in `src/components/ui/` or relevant feature folder

## References
- See `README.md` for setup, Firebase, and CORS instructions
- See `docs/` for deployment, schema, and data management guides

---
For unclear conventions or missing patterns, ask for clarification or check `README.md` and `docs/`.
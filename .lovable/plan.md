## Plan

### 1. App-like loading system
- Add a splash screen component (`SplashScreen.tsx`) shown on first paint with brand logo, gradient background, and animated pulse/progress.
- Mount it in `main.tsx` / `App.tsx` — hide after initial data + auth ready (min 800ms for polish).
- Also add a route-change top loading bar (thin gradient bar at top during navigation/data fetch).

### 2. Default Light theme + Bangla
- Update `ThemeProvider` to `defaultTheme="light"`.
- Update `LanguageProvider` default to `"bn"` (already is, but ensure first-visit always uses `bn` regardless of any prior storage migration).
- Keep user's toggle preference once they change it.

### 3. Mobile-responsive Chatbot
- Refactor `ChatWidget.tsx`:
  - Full-screen sheet on mobile (`<sm`): width 100vw, height 100dvh, no bottom offset, top safe-area.
  - Floating bubble: smaller on mobile, lifted higher (`bottom-24`) to clear sticky CTAs.
  - Sticky input bar with keyboard-safe padding (`pb-[env(safe-area-inset-bottom)]`).
  - Larger touch targets, better message bubbles, auto-focus on open (desktop only).

### 4. Customer login + Customer Dashboard
- **Auth changes**:
  - Allow customer (non-admin) signup + login on `/auth` (currently admin-only flow stays, but customer signup is enabled with Google + email/password).
  - On signup: trigger creates a `profiles` row.
- **DB migration**:
  - `profiles` table: `user_id` (unique, FK auth.users), `display_name`, `phone`, `avatar_url`.
  - Auto-create profile via `handle_new_user` trigger on `auth.users`.
  - Add nullable `user_id` column to `orders` + `contact_messages` so customer's submissions are linked when logged in.
  - RLS: customers read/update own profile; customers read own orders/contact_messages (admin keeps existing access).
- **New page `/dashboard`** (`src/pages/Dashboard.tsx`):
  - Tabs: Profile (edit name/phone), My Orders (list with status, items, total), My Messages (contact submissions + chatbot conversations).
  - Order detail expansion shows order_items.
- **Wiring**:
  - Checkout/Contact forms attach `user_id` if logged in.
  - Navbar: when logged-in non-admin → show "Dashboard" + Logout; when guest → show "Login".
  - Keep existing admin redirect to `/admin`.

### Technical details
- Files to **create**: `src/components/SplashScreen.tsx`, `src/components/RouteLoader.tsx`, `src/pages/Dashboard.tsx`, migration for `profiles` + order/contact `user_id` + customer RLS.
- Files to **edit**: `src/main.tsx` or `src/App.tsx` (splash + route loader), `src/components/ThemeProvider.tsx` (defaultTheme="light"), `src/i18n/LanguageProvider.tsx` (default bn enforcement), `src/components/ChatWidget.tsx` (mobile full-screen + responsive polish), `src/pages/Auth.tsx` (customer signup tab + redirect non-admin to `/dashboard`), `src/components/Navbar.tsx` (Dashboard/Logout link), `src/components/CartDrawer.tsx` or checkout submit (attach user_id), `src/components/ContactForm.tsx` (attach user_id), `src/App.tsx` (new `/dashboard` route).
- No changes to admin tables/policies; only additive.

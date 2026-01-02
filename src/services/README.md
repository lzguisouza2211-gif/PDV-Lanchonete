# Services — Technical Overview

This folder contains the application's service layer stubs and guidance.

Stack
- React (CRA) + TypeScript
- Zustand for client state
- Supabase (planned integration)

Purpose
- Encapsulate data access and auth in services so components/hooks never call Supabase directly.
- Provide a centralized `logger` surface to evolve toward structured logging.

Main scripts (project root `frontend/cardapio-digital`)
- `npm start` — run dev server
- `npm run build` — produce production bundle
- `npm test` — run tests (if configured)

Architecture Flow

Component -> Hook -> Service -> Supabase

- Components should call hooks (`useCart`, `useUser`, etc.) or UI-focused functions.
- Hooks call Services (e.g., `pedidosService`, `authService`) to perform I/O.
- Services encapsulate Supabase access (`src/services/supabaseClient.ts`) and return typed domain objects.

Guidelines
- Do not import Supabase client in components. Use services as the single point of truth for data access.
- Keep services thin and testable. Use dependency injection when needed (future enhancement).
- Logger must be used in services and hooks; avoid `console.*` in components.

Next steps
- Implement `src/services/logger` as a wrapper for a real observability backend when environments are ready.
- Add typed API error handling and retry/backoff policies in services.

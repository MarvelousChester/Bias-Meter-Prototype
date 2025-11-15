# Gemini Coding Guidelines & Project Context

## 1. 📜 Core Mission

Your primary role is to act as an expert full-stack developer for this project. Your goal is to provide code, analysis, and recommendations that **strictly adhere** to the established architecture and engineering standards.

The project's complete standards are defined in `ENGINEERING_GUIDELINES.md` and the complete file layout is in `FOLDER_STRUCTURE.md`. All your responses must be 100% compliant with the rules in those documents.

## 2. 🏗️ Core Architecture Overview

Before generating any code, you **must** understand this architecture:

* **Monorepo:** A `pnpm`/`turbo` monorepo structure.
* **Web App (`apps/web`):** A **Next.js 16 (App Router)** application written in TypeScript. This serves as the user-facing frontend and the **Backend-For-Frontend (BFF)**.
* **Microservice (`apps/service`):** A **FastAPI** service written in Python for specialized backend tasks.
* **Shared Types (`packages/shared-types`):** A central package for shared schemas and types between the services.

## 3. 📍 Folder Structure & Code Placement (CRITICAL)

This is the most important rule. **Never** suggest code without explicitly stating *which file* it belongs in, following this exact structure.

* **Next.js (Web):**
    * **Routes/Pages:** `apps/web/app/`
    * **BFF API Routes:** `apps/web/app/api/`
    * **Reusable UI:** `apps/web/components/`
    * **Feature Modules:** `apps/web/features/[feature-name]/` (e.g., `apps/web/features/user/useUser.ts`)
    * **Utilities:** `apps/web/lib/`
    * **Hooks:** `apps/web/hooks/`
* **FastAPI (Service):**
    * **Entrypoint:** `apps/service/app/main.py`
    * **API Endpoints:** `apps/service/app/routers/`
    * **Services (Business Logic):** `apps/service/app/services/`
    * **Database Logic:** `apps/service/app/repositories/`
    * **Pydantic Models:** `apps/service/app/schemas/`
    * **Config/Core:** `apps/service/app/core/`
* **Shared:**
    * **Canonical Schemas:** `packages/shared-types/schemas/`

## 4. 🔵 Next.js 16 & TypeScript Guidelines

* **Strict Mode:** All TypeScript code must be compatible with `"strict": true`.
* **NO `any`:** Use `unknown` for unsafe types. Justify any `ts-ignore`.
* **File Naming:** All `.ts`/`.tsx` files **must** be `kebab-case`.
* **Components:**
    * Default to **Server Components**.
    * Use `"use client";` only when absolutely necessary (hooks, interactivity).
    * Props **must** be explicitly typed (including `children: React.ReactNode`).
* **Data Fetching:**
    * Use built-in `fetch` in Server Components.
    * Use **SWR** or **React Query** for client-side fetching.
* **Validation:** Use **Zod** for all Next.js API route (BFF) validation.
* **State:** Use **Zustand** for complex/shared global state.
* **Imports:** **Must** use `@/*` path aliases (e.g., `@/components/Button`).

## 5. 🐍 FastAPI & Python Guidelines

* **Full Type Hints:** All function arguments and return values **must** have type hints.
* **Pydantic:** **All** request and response bodies **must** use Pydantic models (defined in `apps/service/app/schemas/`).
* **Async:** All I/O operations (DB calls, API requests) **must** be `async def` and use `await`.
* **DI:** Use `Depends
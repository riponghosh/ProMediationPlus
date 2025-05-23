---
applyTo: '**'
---

# MediatorPro Project: AI Coding Instructions

## 1. Introduction

Welcome to the MediatorPro project! This document provides guidelines and standards for the AI (GitHub Copilot in agent mode) to follow when generating or modifying code for this application. Adhering to these instructions will help maintain code quality, consistency, and alignment with the project's architecture.

MediatorPro is a web application designed to help mediators manage their cases, clients, documents, billing, scheduling, and overall workflow efficiently.

## 2. Project Overview

*   **Goal:** To create a comprehensive, user-friendly platform for mediation professionals.
*   **Target Users:** Mediators, Administrative Staff, and potentially Clients (with limited, role-based access).
*   **Core Functionalities:** Case management, client database, secure document storage, invoicing and payments, appointment scheduling (including Calendly integration), note-taking, reporting, user role management, real-time chat, and task management.

## 3. Technology Stack

*   **Frontend:** React (`react`, `react-dom`) with Vite (`vite`) as the build tool.
*   **Language:** TypeScript (`typescript`). Strict mode is enabled.
*   **UI Framework:** Shadcn/ui, built on Radix UI primitives and styled with Tailwind CSS.
    *   Key libraries: `@radix-ui/*`, `lucide-react`, `tailwind-merge`, `clsx`, `class-variance-authority`.
*   **Styling:** Tailwind CSS (`tailwindcss`). Utility-first approach.
*   **Routing:** React Router DOM (`react-router-dom`) for client-side navigation.
*   **State Management:**
    *   Global: React Context API (e.g., `AuthContext` in `src/contexts/AuthContext.tsx`, `TasksContext` in `src/contexts/TasksContext.tsx`).
    *   Local: `useState`, `useReducer` hooks.
*   **Forms:** React Hook Form (`react-hook-form`) with Zod (`zod`) for schema validation.
*   **Date/Time:** `date-fns`.
*   **Linting:** ESLint (`eslint`) with TypeScript plugins.
*   **Charting/Visualization:** Recharts (`recharts`) for reports.
*   **Backend (Server-side logic/APIs):** Node.js with Express (as indicated by `server.ts` and `dist-server/server.js`). Potentially using `ts-node` or similar for TypeScript execution in Node.js.
    *   API routes for features like Calendly integration (`src/api/calendlyApiRoutes.ts`, `src/api/calendlyAuthRoutes.ts`) and chat (`src/api/chat.ts`).

## 4. Project Structure

Familiarize yourself with the workspace structure. Key directories include:

*   `src/`: Contains all frontend application source code.
    *   `App.tsx`: Main application component, sets up routing.
    *   `main.tsx`: Entry point of the application.
    *   `pages/`: Top-level route components (e.g., `Dashboard.tsx`, `Cases.tsx`, `Contacts.tsx`, `Calendar.tsx`, `Tasks.tsx`).
        *   `admin/`, `auth/`, `cases/`, `forms/`, `guides/`, `templates/`: Sub-directories for specific page groups.
    *   `components/`: Reusable UI components.
        *   `ui/`: Shadcn/ui components (often customized or re-exported).
        *   `layout/`: Components related to page structure (Sidebar, Header, etc.).
        *   Domain-specific components (e.g., `components/cases/`, `components/dashboard/`, `components/dialogs/`, `components/tasks/`).
    *   `services/`: Modules for interacting with services and APIs.
        *   `authService.ts` (or similar): Authentication related functions.
        *   `calendlyService.ts`: For Calendly API interactions.
        *   `localDbService.ts`: For local database interactions (potentially IndexedDB or similar).
        *   `storageService.ts`: For file storage interactions.
    *   `contexts/`: React Context providers for global state (e.g., `AuthContext.tsx`, `TasksContext.tsx`).
    *   `hooks/`: Custom React hooks (e.g., `useToast.ts`, `use-mobile.tsx`).
        * `data/`: Potentially for hooks related to data fetching or manipulation.
    *   `types/`: TypeScript type definitions.
        *   `models.ts`: Core data models.
        *   `roles.ts`: User role definitions (if present, otherwise general types).
        *   `calendlyTypes.ts`: Types specific to Calendly integration.
        *   `schemas.ts` (or similar, if form validation schemas are centralized here).
    *   `routes/`: Route definitions and path constants (`paths.ts`).
    *   `lib/`: Utility functions and libraries (e.g., `dateUtils.ts`, `utils.ts`, `mobileStyling.ts`).
    *   `styles/`: Global or component-specific stylesheets (e.g., `calendar.css`).
    *   `api/`: Client-side API route definitions or stubs that correspond to server-side handlers.
        *   `chat/`: Client-side logic for chat features.
*   `public/`: Static assets served directly by Vite (e.g., `favicon.ico`, images, videos).
*   `server.ts` (and `dist-server/`): Backend server code, likely Express.js, handling API requests.
    *   `src/api/` (within `dist-server` or a similar structure for compiled server code): Contains server-side API route handlers (e.g., `calendlyApiRoutes.js`, `chat.js`).
*   `functions/`: (If used for serverless functions, e.g., Firebase Cloud Functions)
    *   `src/index.ts`: Main entry point for cloud functions.
    *   `src/setCustomClaims.ts`: Example function for managing user roles.
*   **Root Configuration Files:**

    *   `vite.config.ts`: Vite build configuration.
    *   `tailwind.config.ts`: Tailwind CSS configuration.
    *   `tsconfig.json`: TypeScript compiler options for the frontend.
    *   `package.json`: Project dependencies and scripts.

## 5. Coding Standards & Conventions

*   **Language:** Strictly TypeScript. Leverage its features for type safety. Avoid `any` where possible; define specific types in `src/types/`.
*   **Path Aliases:** Use `@/*` for imports from the `src/` directory (e.g., `import { MyComponent } from '@/components/MyComponent';`).
*   **Naming Conventions:**
    *   Components: PascalCase (e.g., `UserProfile.tsx`).
    *   Files (non-components): camelCase (e.g., `path.ts`) or kebab-case (e.g., `user-profile-form.tsx` if it's a complex, non-reusable form structure). Prefer camelCase for services and hooks.
    *   Variables & Functions: camelCase (e.g., `const userName = ...;`, `function getUserProfile() {}`).
    *   Interfaces & Types: PascalCase (e.g., `interface UserProfile {}`).
    *   CSS classes (if custom beyond Tailwind): kebab-case.
*   **Component Design:**
    *   Follow React best practices: functional components with hooks.
    *   Keep components small, focused, and reusable.
    *   Props: Define interfaces for component props.
*   **Styling:**
    *   Primarily use Tailwind CSS utility classes.
    *   Utilize Shadcn/ui components and adhere to their composition patterns.
    *   For custom component styles not achievable with Tailwind alone, consider CSS Modules or styled components if absolutely necessary (current setup is Tailwind-focused).
*   **State Management:**
    *   Use React Context (`AuthContext`, etc.) for global or widely shared state.
    *   For component-local state, use `useState` or `useReducer`.
*   **Type Definitions:**
    *   Centralize all shared data model interfaces in `src/types/models.ts`.
    *   Define specific types for function parameters and return values.
*   **Comments:**
    *   Write JSDoc comments for all functions, components, and complex logic.
    *   Explain non-obvious code sections.
*   **Imports:**
    *   Organize imports: React, external libraries, then project-local (`@/`) imports.
    *   Remove unused imports.
*   **Error Handling:**
    *   Implement robust error handling in UI components, catching errors from service calls.
    *   Use the `useToast` hook (or a similar mechanism) to display user-friendly notifications for success and error states.
*   **Security:**
    *   Always prioritize security.

    *   Be mindful of role-based access control (RBAC) using custom claims. Ensure UI and service logic respects these roles.
*   **Forms:**
    *   Use `react-hook-form` for all forms.
    *   Define validation schemas using `zod` in `src/types/schemas.ts` (or near the form component if highly specific).

## 6. Interacting with the AI (You, GitHub Copilot!)

To get the best results when I ask you to write or modify code:

*   **Be Specific & Clear:**
    *   Clearly state the task, the desired outcome, and any constraints.
    *   Example: "Create a new React component named `CaseSummaryCard` in `src/components/cases/CaseSummaryCard.tsx`. It should display the case title, status, and client name. Use Shadcn Card components."
*   **Provide Context:**
    *   **File Paths:** Always specify the full absolute path for new files or files to be modified (e.g., `c:/Users/dubli/Downloads/VS CODE/MEDIATORPRO/src/pages/NewPage.tsx`).
    *   **Existing Code:** If modifying existing code, point to the specific function, component, or lines. You can use "..." to denote existing, unchanged code.
    *   **Data Models:** Refer to existing types in `src/types/models.ts` or ask to define new ones there first.
*   **Iterative Development:**
    *   For complex features, I may break down the request into smaller, manageable steps.
    *   I will review your suggestions and provide feedback for refinement.
*   **Error Handling:**
    *   If you generate code that results in errors (linting, type, runtime), I will provide the error message and ask you to help fix it.
    *   When you write service functions, include `try/catch` blocks and consider how errors should be reported to the UI.
*   **New Feature Workflow:**
    1.  **Types:** Define or update data structures in `src/types/models.ts`.
    2.  **Services:** Create or update service functions in `src/services/` for any backend interactions.
    3.  **Components/UI:** Develop React components in `src/components/` or `src/pages/`.
    4.  **State:** Integrate with global state (Contexts) if necessary.
    5.  **Routing:** Update routes in `src/routes/paths.ts` and `src/App.tsx`.
    6.  **Navigation:** Update sidebar or other navigation elements.
    7.  **Security Rules:** Consider if `storage.rules` need updates.
*   **UI Development:**
    *   Specify which Shadcn/ui components to use or adapt (e.g., `Button`, `Dialog`, `Table`).
    *   Describe the desired layout, responsiveness, and any specific styling requirements using Tailwind CSS.
    *   Consider accessibility (ARIA attributes, keyboard navigation) where appropriate.

## 7. Key Files & Paths (Quick Reference)

*   **Data Models:** `src/types/models.ts`, `src/types/calendlyTypes.ts` (add `src/types/roles.ts` if it exists)
*   **Global State Contexts:** `src/contexts/` (e.g., `AuthContext.tsx`, `TasksContext.tsx`)
*   **Reusable UI Components:** `src/components/`
*   **Shadcn/ui Components:** `src/components/ui/`
*   **Page Components:** `src/pages/`
*   **Routing Logic:** `src/routes/paths.ts`, `src/App.tsx`
*   **Service Logic:** `src/services/`
*   **Backend API Logic:** `server.ts`, `src/api/` (client-side stubs), `dist-server/src/api/` (compiled server-side handlers)
*   **Tailwind Config:** `tailwind.config.ts`
*   **Vite Config:** `vite.config.ts`
*   **TypeScript Configs:** `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
*   **ESLint Config:** `eslint.config.js`

## 8. Do's and Don'ts

*   **Do:**
    *   Follow existing patterns in the codebase.
    *   Write clean, readable, and maintainable code.
    *   Ensure all new code is strictly typed with TypeScript.
    *   Update or create types in `src/types/` as needed.
    *   Encapsulate business logic and API calls in service layers.
    *   Use descriptive names for variables, functions, and components.
    *   Implement error handling and provide user feedback (e.g., toasts).
    *   Write JSDoc comments for public functions and components.
*   **Don't:**
    *   Introduce new third-party libraries without explicit instruction.
    *   Write overly complex or monolithic components.
    *   Duplicate code; create reusable functions or components instead.
    *   Leave `console.log` statements in production code.
    *   Commit commented-out code unless it's for a specific, temporary reason.

## 9. Pushing to GitHub

When you're ready to push your changes to a new branch on GitHub, follow these steps:

1.  **Create and switch to a new branch:**
    ```bash
    git checkout -b "name-of-your-new-branch"
    ```
    *Replace `"name-of-your-new-branch"` with a descriptive name for your branch (e.g., `feature/add-case-filtering`, `fix/login-bug`).*

2.  **Stage all your changes:**
    ```bash
    git add .
    ```

3.  **Commit your changes:**
    ```bash
    git commit -m "Your descriptive commit message"
    ```
    *Write a clear and concise message that explains the changes you made.*

4.  **Push your branch to the remote repository (origin):**
    ```bash
    git push -u origin "name-of-your-new-branch"
    ```

By following these guidelines, you will be an invaluable assistant in developing MediatorPro. Let's build something great!
# GitHub Copilot Instructions - Rabbit101 / BlueChat AI

## 🏗 Project Architecture & Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4, `framer-motion` for animations, `lucide-react` for icons.
- **State Management:** React Context (`AuthContext`, `ThemeContext`).
- **Data Persistence:**
    - **Local:** `dexie` (IndexedDB) for chat history (`src/utils/indexedDb.ts`).
    - **Remote:** API routes in `src/app/api`.
- **Theme:** `next-themes` with `'class'` strategy. Uses CSS variables (`--background`, `--foreground`) defined in `src/app/globals.css`.
- **Layouts:** `src/components/layout/AppLayout.tsx` handles responsive sidebar and main content area.

## 🧩 UI Component Guidelines
**Strictly use the custom UI Kit in `src/components/ui`. Do not use raw HTML elements or generic libraries.**

### Buttons
- **Path:** `src/components/ui/Button.tsx`
- **Props:**
    - `variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'` (Default: `primary`)
    - `size`: `'sm' | 'md' | 'lg' | 'xl'` (Default: `md`) **Note: strictly no 'icon' size. Use className for sizing icon buttons.**
    - `isLoading`: Shows spinner.
    - `leftIcon`, `rightIcon`: Pass `lucide-react` components directly.

### Avatars
- **Path:** `src/components/ui/Avatar.tsx`
- **Props:**
    - `name`: string (Used for fallback/alt text). **Do NOT use `fallback` prop.**
    - `src`: string (Image URL or Emoji).
    - `size`: `'sm' | 'md' | 'lg' | 'xl'` (Default: `md`).

### Common Patterns
- **Cards:** Use `Card` component for containers.
- **Glassmorphism:** Use `backdrop-blur-md` and `bg-white/10` (or `bg-black/10` in dark mode) utilities consistent with `Card` implementation.
- **Gradients:** Use gradients like `bg-gradient-to-r from-violet-600 to-purple-600` for primary actions.

## 🛠 Developer Workflow & Build System
- **Build Command:** `npm run build`
    - **Note:** The build is strict. TypeScript errors will fail the build immediately.
    - **Turbopack:** You may see warnings about lockfiles or root directory; these are usually safe to ignore if the build proceeds.
- **Excluded Folders:** `temp/` is excluded in `tsconfig.json`. Do not write active code there.
- **Type Checking:**
    - **Strict:** `noImplicitAny` is on.
    - **Interfaces:** Defined in `src/types/index.ts`. All data models (`Character`, `Chat`, `AuthUser`) must match these exactly.

## 📦 Data & Services
- **Character Service:** `src/services/characterService.ts`
    - **Creating Characters:** Payload must exclude `id`, `createdAt`, `updatedAt`, BUT `studentId` handling differs between frontend/backend. Frontend payload usually does NOT require `studentId` as it's handled by logical context or backend session, but strict types might require `Omit<Character, ... 'studentId'>`.
- **Gemini Service:** `src/services/geminiService.ts`
    - Handles AI streaming and risk detection. Use `sendMessage` for text and `startLiveSessionSimple` for voice.

## 🚨 Troubleshooting & frequent Issues
- **Type Mismatches:**
    - `AuthUser` now includes `name`. Ensure auth logic populates it.
    - `Button` does not have `size="icon"`. Use `size="sm"` or custom classes for icon-only buttons.
    - `Avatar` does not have `fallback`. Use `name`.
- **Imports:** check `src/components/layout/index.ts` or `src/components/ui/index.ts` for barrel exports before importing directly.

## 🎨 Design System ("BlueChat")
- **Visual Style:** Rounded corners (Pill), Gradient accents, Slate/Zinc dark mode base (`#0f0d1a`).
- **Icons:** Use `lucide-react`.
- **Motion:** `framer-motion` is standard for transitions (page loads, modal popups).

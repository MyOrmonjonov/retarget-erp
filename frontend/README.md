# Retarget ERP Frontend

Professional React frontend for Retarget ERP - a multi-user project management/CRM system for creative agencies.

## Tech Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS 4** + **Shadcn/UI** (copy-paste components)
- **TanStack Query v5** (server state) + **Zustand v5** (client state)
- **React Router v7** with role-based guards
- **React Hook Form** + **Zod** (forms & validation)
- **Recharts** (charts) + **@dnd-kit** (Kanban drag & drop)
- **Axios** with interceptors (auto token refresh)

## Design System

Dark theme with neon green (#C6FF3D) accent:
- Background: #121212 (primary), #1A1A1D (sidebar), #1C1C1F (surface)
- Text: #FFFFFF (primary), #9A9A9A (secondary), #6B6B6B (muted)
- Status: #34C759 (success), #FF9F0A (warning), #FF3830 (error)

Typography: Inter font, H1: 32px/700, H2: 24px/700, H3: 18px/600, Body: 14px/400

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

App runs at `http://localhost:5173` with API proxy to `http://localhost:8080`.

## Project Structure

```
src/
├── app/                    # App-level providers, router
│   ├── providers.tsx       # QueryClient, Auth, Theme providers
│   ├── router.tsx          # React Router v7 with guards
│   └── routes/guards.tsx   # RequireAuth component
├── features/               # Feature-based modules
│   ├── auth/               # Login, tokens, auth store
│   ├── dashboard/          # Dashboard widgets
│   ├── projects/           # Projects CRUD
│   ├── tasks/              # Tasks list & Kanban
│   ├── employees/          # Employees, profile, attendance, KPI
│   ├── design-dept/        # Design Kanban
│   ├── editing-dept/       # Editing Kanban
│   ├── shooting/           # Shooting calendar
│   ├── sales/              # Target & Sales
│   ├── finance/            # Finance/Payments
│   ├── mapping/            # Mapping/Steps
│   └── settings/           # User settings
├── shared/                 # Shared utilities & components
│   ├── ui/                 # Shadcn/UI components
│   ├── components/         # Composite components (Sidebar, Header, etc.)
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities (api, cn, formatters)
│   ├── types/              # TypeScript types
│   └── constants/          # Navigation, roles, colors
└── styles/
    └── globals.css         # CSS variables, design tokens
```

## User Roles

| Role | Permissions |
|------|-------------|
| CEO | Full access |
| MENEJER | Projects, Tasks, Employees, KPI, Finance, Reports |
| BOSHQARUVCHI | Projects (read), Tasks, Employees (read), KPI, Attendance |
| MONTAJOR | Tasks, Projects (read) |
| HODIM | Tasks, Projects (read) |
| OPERATOR | Tasks (read), Projects (read) |

## Available Scripts

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run build:telegram` - Build for Telegram Mini App
- `npm run lint` - ESLint check
- `npm run typecheck` - TypeScript check
- `npm run preview` - Preview production build

## Telegram Mini App

```bash
npm run build:telegram
```

Outputs to `dist-telegram/` with Telegram WebApp SDK integration ready.

## Backend Integration

Connects to Spring Boot backend at `http://localhost:8080/api`:
- JWT authentication (Access 15min + Refresh 7d httpOnly cookie)
- Auto token refresh on 401
- RESTful API with standard CRUD endpoints

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:8080/api | Backend API URL |
| VITE_WS_URL | ws://localhost:8080/ws | WebSocket URL |
| VITE_APP_NAME | Retarget ERP | App name |

## License

Private - Retarget ERP
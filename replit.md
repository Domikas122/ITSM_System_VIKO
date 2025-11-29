# Incident Management System

## Overview
A web-based IT and cyber incident management system that allows employees to register incidents, and specialists to manage them, view their history, and receive AI-powered recommendations. Built with a modern full-stack JavaScript/TypeScript architecture.

## Tech Stack
- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js with TypeScript
- **State Management**: TanStack Query (React Query)
- **AI Integration**: OpenAI GPT-5 for incident analysis
- **Routing**: Wouter
- **Storage**: In-memory (MemStorage) - ready for PostgreSQL migration

## Project Structure
```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities and contexts
│   │   └── hooks/       # Custom React hooks
├── server/              # Backend Express server
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Data storage layer
│   └── openai.ts        # OpenAI integration
└── shared/              # Shared types and schemas
    └── schema.ts        # Data models and validation
```

## Key Features
1. **Incident Registration** - Form with title, description, category (IT/Cyber), severity, affected systems
2. **Dashboard** - Stats cards, filtering, incident list for specialists
3. **Role-Based Views** - Employee view (own incidents) vs Specialist view (all incidents)
4. **Status Workflow** - New → Assigned → In Progress → Resolved → Closed
5. **AI Analysis** - OpenAI-powered incident analysis and tag suggestions
6. **Similar Incidents** - Finds related past incidents for reference
7. **History Timeline** - Tracks all status changes and updates

## API Endpoints
- `GET /api/incidents` - List incidents with optional filters
- `GET /api/incidents/stats` - Dashboard statistics
- `GET /api/incidents/:id` - Get incident with details
- `POST /api/incidents` - Create new incident
- `PATCH /api/incidents/:id/status` - Update incident status
- `PATCH /api/incidents/:id/assign` - Assign incident to specialist
- `POST /api/incidents/:id/analyze` - Run AI analysis

## Environment Variables
- `OPENAI_API_KEY` - Required for AI analysis (optional - works with mock analysis if not set)

## Running the Application
The application runs on port 5000 with `npm run dev`.

## User Preferences
- Clean, professional design following Linear/ServiceNow patterns
- Information-dense but scannable interface
- Dark mode support
- Responsive layout with sidebar navigation

## Recent Changes
- Initial MVP implementation with all core features
- Added dark mode support with theme toggle
- Implemented role switcher for testing employee/specialist views
- Created AI analysis panel with OpenAI integration

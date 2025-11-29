# Incident Management System - Design Guidelines

## Design Approach
**System-Based Approach**: Drawing from Linear's clean efficiency and modern enterprise dashboards (ServiceNow, Jira Service Desk patterns). Focus on clarity, efficient workflows, and scannable information density.

**Core Principles**:
- Information clarity over decoration
- Efficient task completion flows
- Clear visual hierarchy for status and priority
- Minimal cognitive load for specialists under pressure

---

## Typography

**Font Stack**: Inter (Google Fonts)
- Headlines/Page Titles: 24-32px, semibold (600)
- Section Headers: 18-20px, medium (500)
- Body/Table Content: 14-16px, regular (400)
- Labels/Metadata: 12-14px, medium (500)
- Status Badges: 12px, medium (500), uppercase

---

## Layout System

**Spacing Units**: Tailwind primitives - 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: mb-8 to mb-12
- Card gaps: gap-4
- Form field spacing: space-y-4

**Grid Structure**:
- Dashboard: Sidebar (240px fixed) + Main content area
- Incident lists: Full-width tables with sticky headers
- Detail views: 2-column layout (main content 60% + metadata sidebar 40%)

---

## Component Library

### Navigation & Layout
- **Top Bar**: Fixed header with system title, role indicator, user profile (h-16, border-b)
- **Sidebar**: Fixed navigation with icons + labels, active state highlight, role-based menu items
- **Content Container**: max-w-7xl mx-auto, px-6 py-8

### Data Display
- **Incident Cards**: Compact cards with title, ID, status badge, severity indicator, timestamp (rounded-lg border)
- **Data Tables**: Alternating row backgrounds, sortable columns, sticky header, row hover states
- **Status Badges**: Pill-shaped with distinct treatments per status (rounded-full px-3 py-1)
  - New: Subtle background
  - Assigned: Medium emphasis
  - In Progress: Bold, high contrast
  - Resolved/Closed: Muted treatment
- **Severity Indicators**: Small circular dots or vertical bars (Critical/High/Medium/Low)
- **Timeline**: Vertical line with event nodes showing incident history

### Forms & Input
- **Input Fields**: Clear labels above inputs, consistent height (h-10), border with focus states
- **Text Areas**: For incident descriptions (min-h-32)
- **Dropdowns**: Native-styled selects or custom dropdowns for category, severity, assignment
- **Submit Buttons**: Primary action buttons (px-6 py-2.5)

### AI Features
- **Similar Incidents Panel**: Card-based list showing AI-matched incidents with similarity score
- **AI Recommendations**: Highlighted box with suggested tags/categories (border-l-4 accent, bg-subtle, p-4)

### Overlays
- **Incident Detail Modal**: Large modal (max-w-4xl) with header, scrollable content, actions footer
- **Confirmation Dialogs**: Small centered modals (max-w-sm) for delete/close actions

---

## Specific Screen Layouts

### Dashboard (Specialist View)
- Stats row: 4-column grid showing incident counts by status (grid-cols-4 gap-4)
- Filter bar: Horizontal filters for status, category, severity, date range
- Incident table: Full-width with columns: ID, Title, Category, Severity, Status, Assigned To, Created Date, Actions

### Incident Registration Form (Employee View)
- Single column centered form (max-w-2xl)
- Fields: Title, Description (textarea), Category (dropdown), Severity (radio buttons), Affected Systems (multi-select)
- Submit button prominently placed

### Incident Detail View
- Left content (60%): Title, description, AI analysis, timeline history
- Right sidebar (40%): Status, severity, metadata (created, updated, assigned specialist), similar incidents panel

---

## Images
No hero images needed. This is a utility dashboard - focus on functional clarity. Use icons throughout (Heroicons via CDN) for:
- Status indicators
- Severity levels
- Navigation menu items
- Action buttons (edit, delete, assign)
- Empty states for "no incidents"

---

## Animations
**Minimal use only**:
- Smooth transitions on status badge changes (150ms)
- Subtle hover states on rows/cards
- Modal fade-in (200ms)
- No loading spinners unless data fetch exceeds 1 second

---

## Key Design Details
- **Density**: Information-rich but not cramped - balance between showing data and readability
- **Scanability**: Clear visual separation between incident rows, strong status indicators
- **Consistency**: Repeated patterns for cards, tables, forms across all views
- **Accessibility**: High contrast for status indicators, keyboard navigation support, clear focus states
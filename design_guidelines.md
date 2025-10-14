# Design Guidelines - Fleet Management SaaS Platform

## Design Approach

**Selected Approach:** Design System - Modern Enterprise Dashboard
**Primary References:** Linear (clean data presentation), Notion (organized information architecture), Asana (task management clarity)
**Rationale:** B2B SaaS fleet management requires data-dense, utility-focused design prioritizing efficiency, quick information scanning, and multi-role workflows. The existing blue interface indicates professional, trustworthy brand positioning.

## Core Design Principles

1. **Data Clarity First:** Information hierarchy optimized for quick scanning and decision-making
2. **Professional Efficiency:** Clean, distraction-free interface supporting complex workflows
3. **Role-Based Contextual UI:** Interface adapts to user permissions (Super Admin, Manager, Driver)
4. **Trust & Reliability:** Visual language reinforcing system stability and data security

---

## Color Palette

### Dark Mode (Primary)
- **Background Base:** 220 25% 8% (deep blue-black)
- **Background Elevated:** 220 20% 12% (cards, panels)
- **Background Hover:** 220 18% 15%
- **Primary Blue:** 214 95% 55% (action buttons, active states) - inspired by user's screenshots
- **Primary Blue Hover:** 214 95% 48%
- **Text Primary:** 220 15% 95%
- **Text Secondary:** 220 10% 65%
- **Border:** 220 15% 20%
- **Success:** 142 76% 36% (available vehicles, completed maintenance)
- **Warning:** 38 92% 50% (maintenance due, low fuel)
- **Danger:** 0 84% 60% (overdue, critical alerts)

### Light Mode (Secondary)
- **Background Base:** 220 20% 98%
- **Background Elevated:** 0 0% 100%
- **Primary Blue:** 214 95% 45%
- **Text Primary:** 220 25% 15%
- **Text Secondary:** 220 10% 45%
- **Border:** 220 15% 88%

---

## Typography

**Font Stack:** Inter (primary), -apple-system, system-ui (fallback) via Google Fonts CDN

### Hierarchy
- **Page Titles:** text-3xl font-bold (30px)
- **Section Headers:** text-xl font-semibold (20px)
- **Card Titles:** text-lg font-semibold (18px)
- **Body Text:** text-base font-normal (16px)
- **Labels/Metadata:** text-sm font-medium (14px)
- **Captions/Helper:** text-xs font-normal (12px)

**Line Heights:** leading-tight for headers, leading-relaxed for body text

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: mb-8, gap-6
- Card spacing: p-6
- Form fields: space-y-4
- Grid gaps: gap-4 to gap-6

**Container Strategy:**
- Dashboard: Full-width fluid layout with max-w-screen-2xl mx-auto px-6
- Content areas: Grid-based with responsive columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Forms: max-w-2xl centered for optimal data entry
- Data tables: Full-width responsive with horizontal scroll on mobile

---

## Component Library

### Navigation
- **Sidebar:** Fixed left sidebar (w-64) with collapsible sub-menus, active state highlighting with primary blue background
- **Top Bar:** Sticky header with tenant switcher, search, notifications, user menu
- **Breadcrumbs:** Secondary navigation showing current location hierarchy

### Data Display
- **Tables:** Striped rows with hover states, sortable headers, inline actions, sticky header for long lists
- **Cards:** Elevated backgrounds (bg-elevated), subtle borders, 12px border-radius
- **Stats/KPIs:** Large numerical display with trend indicators (↑ ↓), color-coded performance
- **Status Badges:** Pill-shaped, color-coded (available/green, in-use/blue, maintenance/orange, critical/red)

### Forms & Inputs
- **Input Fields:** Dark backgrounds matching elevated surface, 8px border-radius, focus ring in primary blue
- **Dropdowns:** Native select styling with custom arrow, searchable for long lists
- **Date Pickers:** Inline calendar widget matching dark theme
- **File Upload:** Drag-and-drop zone with visual feedback

### Actions
- **Primary Button:** Primary blue background, white text, px-6 py-2.5, rounded-lg, medium font-weight
- **Secondary Button:** Transparent with border, primary blue text and border
- **Icon Buttons:** 40x40px circular or square, hover background change
- **Bulk Actions:** Toolbar appearing when items selected in tables

### Feedback
- **Alerts:** Top-right toast notifications, 4-second auto-dismiss, color-coded by severity
- **Modals:** Centered overlay (max-w-2xl), dark backdrop blur, smooth fade-in animation
- **Loading States:** Skeleton screens for data-heavy views, spinner for quick actions
- **Empty States:** Centered illustration + descriptive text + primary CTA

---

## Dashboard-Specific Design

### Analytics Cards
- KPI cards in 3-4 column grid: metric value (text-3xl bold), label (text-sm secondary), trend badge
- Charts: Minimalist line/bar charts using primary blue, transparent fills, subtle grid lines

### Vehicle Grid/List View
- Card view: Vehicle image thumbnail, registration plate (prominent), status badge, key metrics (km/hours), quick actions
- List view: Compact table with expandable rows for details

### Maintenance Calendar
- Timeline view showing upcoming maintenance by vehicle
- Color-coded by urgency: green (scheduled), orange (due soon), red (overdue)
- Filterable by vehicle type, maintenance type

---

## Icons

**Library:** Heroicons via CDN (outline for navigation, solid for filled states)
- Vehicle types: Custom SVG placeholders <!-- CUSTOM ICON: truck/car/bus -->
- Actions: Heroicons (pencil, trash, eye, settings, bell, calendar)
- Status: Solid check/x/clock icons with color backgrounds

---

## Images

### Usage Strategy
- **Dashboard:** No hero images - data-first approach
- **Vehicle Cards:** Thumbnail images (aspect-ratio-video 16:9, object-cover)
- **Empty States:** Simple illustrations for "no data" scenarios
- **User Avatars:** 32px circular with initials fallback
- **Login/Onboarding:** Single hero image showing fleet management concept (optional)

**Image Placement:**
- Vehicle management: Grid of vehicle cards with images
- Driver profiles: Avatar + banner image option
- Reports: Optional chart visualizations exported as images

---

## Accessibility & Responsiveness

- Consistent dark mode across all inputs and text fields
- Focus indicators visible on all interactive elements (2px blue ring)
- ARIA labels for icon-only buttons
- Mobile: Hamburger menu, stacked layouts, touch-friendly 44px minimum tap targets
- Tablet: Collapsible sidebar, 2-column grids

---

## Animation Guidelines

**Minimal, Purposeful Motion:**
- Sidebar collapse/expand: 200ms ease-in-out
- Modal open/close: 150ms fade + slight scale
- Dropdown menus: 100ms slide-down
- Toast notifications: Slide-in from top-right
- **No decorative animations** - focus on functional feedback
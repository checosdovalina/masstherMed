# Design Guidelines: Clínica de Terapias Management System

## Design Approach

**Selected System**: Material Design (Healthcare/Data-Heavy Application Variant)

**Rationale**: This therapy clinic management system requires clarity, professionalism, and efficient data handling. Material Design provides the structured component library and interaction patterns necessary for healthcare applications while maintaining a modern, trustworthy aesthetic.

---

## Typography System

**Font Families** (via Google Fonts):
- Primary: Inter (400, 500, 600, 700) - UI elements, forms, tables
- Secondary: Merriweather (400, 700) - Patient notes, clinical documentation

**Hierarchy**:
- Page Titles: text-3xl font-bold (Inter)
- Section Headers: text-xl font-semibold (Inter)
- Card/Panel Titles: text-lg font-medium (Inter)
- Body Text: text-base font-normal (Inter)
- Form Labels: text-sm font-medium (Inter)
- Helper Text: text-xs font-normal (Inter)
- Clinical Notes: text-base font-normal (Merriweather)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8
- Tight spacing: p-2, gap-2
- Standard spacing: p-4, gap-4, m-4
- Section spacing: p-6, py-6
- Large spacing: p-8, py-8

**Grid Structure**:
- Dashboard: 12-column grid with sidebar (w-64) + main content area
- Forms: Single column (max-w-2xl) for readability
- Patient Lists/Tables: Full-width with responsive breakpoints
- Card Grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

---

## Component Library

### Navigation & Structure

**Sidebar Navigation** (Fixed left, w-64):
- Logo/Clinic Name at top (h-16)
- Main menu items with icons (Heroicons)
- Active state with subtle border-left indicator
- User profile section at bottom
- Collapsible on mobile

**Top Bar**:
- Breadcrumb navigation (text-sm)
- Search functionality (w-96 max)
- Notifications icon with badge
- User avatar dropdown

### Core Components

**Patient Cards**:
- Elevated cards (shadow-md) with rounded-lg borders
- Avatar placeholder (w-12 h-12 rounded-full)
- Patient name (text-lg font-semibold)
- Quick info: Therapy type, Next appointment
- Action buttons (text-sm) aligned right
- Hover state with subtle lift (shadow-lg)

**Data Tables**:
- Clean, striped rows for readability
- Fixed header on scroll
- Sortable columns with arrow indicators
- Action column (right-aligned) with icon buttons
- Pagination controls at bottom
- Responsive: card view on mobile

**Forms**:
- Clear label-above-input pattern
- Input fields: h-10 with rounded borders
- Required field indicator (asterisk)
- Validation states: border treatment for errors
- Helper text below inputs (text-xs)
- Primary action buttons aligned right
- Cancel/secondary actions left-aligned

**Calendar/Scheduler**:
- Week view as default
- Time slots in 30-minute increments
- Appointment blocks with therapy type indicator
- Click to view/edit appointment
- Today highlight treatment
- Navigation controls (prev/next week)

**Patient Expediente (Medical Record)**:
- Tab navigation for sections: Info Personal, Historial, Notas, Documentos
- Timeline view for session history (vertical line with nodes)
- Rich text editor for therapist notes
- Attachment upload area with file list
- Print/Export button in header

### Status Indicators

**Appointment Status**:
- Scheduled, In Progress, Completed, Cancelled
- Badge component (rounded-full px-3 py-1 text-xs font-medium)

**Patient Status**:
- Active, Inactive, Alta (Discharged)
- Colored dot indicator (w-2 h-2 rounded-full)

### Action Buttons

**Primary Actions**: 
- Nueva Cita, Nuevo Paciente, Guardar
- Prominent, rounded-md, px-4 py-2

**Secondary Actions**:
- Ver Detalles, Editar, Cancelar
- Outlined style or ghost treatment

**Icon Buttons**:
- Edit, Delete, View (Heroicons)
- w-8 h-8, rounded hover states

---

## Animations

**Minimal, Purposeful Motion**:
- Modal fade-in (150ms ease-out)
- Dropdown slide-down (100ms)
- Hover lift on cards (200ms)
- No scroll-driven animations
- No loading spinners beyond necessary

---

## Accessibility Standards

- All form inputs with associated labels (for attribute)
- ARIA labels for icon-only buttons
- Keyboard navigation support throughout
- Focus indicators visible and consistent
- Minimum touch target: 44x44px
- Contrast ratios meet WCAG AA standards

---

## Images

**No large hero images** - This is a functional web application, not a marketing site.

**Profile/Avatar Placeholders**:
- Patient avatars in cards and headers
- Therapist photos in assignment views
- Use placeholder initials in circular containers when no photo

**Icons**: Heroicons (via CDN) throughout for consistency
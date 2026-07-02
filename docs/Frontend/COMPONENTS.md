# Shift944 — UI Component Library

The Shift944 UI library is built using Tailwind CSS v4 and Framer Motion. It is designed to be highly accessible, dark-mode first, and responsive.

## Component Registry

### 1. `Button`
Located at [Button.jsx](file:///c:/Users/prasa/OneDrive/Desktop/Shift944/frontend/src/components/ui/Button.jsx).
- **Props**:
  - `variant`: `'primary'` | `'secondary'` | `'outline'` | `'ghost'` | `'danger'`
  - `size`: `'sm'` | `'md'` | `'lg'`
  - `loading`: Boolean (Renders a spinning loading indicator and disables clicks)
  - `disabled`: Boolean

### 2. `Input`
Located at [Input.jsx](file:///c:/Users/prasa/OneDrive/Desktop/Shift944/frontend/src/components/ui/Input.jsx).
- **Props**:
  - `label`: String (Renders an input label)
  - `error`: String (Renders validation error text)
  - Supports all standard HTML `<input>` props (placeholder, type, onChange, etc.)

### 3. `Card`
Located at [Card.jsx](file:///c:/Users/prasa/OneDrive/Desktop/Shift944/frontend/src/components/ui/Card.jsx).
- Glassmorphic panels featuring backdrop filters and subtle borders.
- Subcomponents: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

### 4. `Badge`
Located at [Badge.jsx](file:///c:/Users/prasa/OneDrive/Desktop/Shift944/frontend/src/components/ui/Badge.jsx).
- **Variants**: `'success'` | `'warning'` | `'error'` | `'info'` | `'pending'` | `'publishing'`

### 5. `Modal`
Located at [Modal.jsx](file:///c:/Users/prasa/OneDrive/Desktop/Shift944/frontend/src/components/ui/Modal.jsx).
- Portal-based modal with backdrop overlay, scroll lock, and Framer Motion scale transitions.
- **Props**: `isOpen`, `onClose`, `title`.

### 6. `Avatar`
Located at [Avatar.jsx](file:///c:/Users/prasa/OneDrive/Desktop/Shift944/frontend/src/components/ui/Avatar.jsx).
- Renders user avatars with initials fallback if the image fails to load.

### 7. `EmptyState`
Located at [EmptyState.jsx](file:///c:/Users/prasa/OneDrive/Desktop/Shift944/frontend/src/components/ui/EmptyState.jsx).
- Displays a clean illustration/icon, title, description, and action button.
- **Props**: `icon`, `title`, `description`, `actionText`, `onAction`.

### 8. `LoadingOverlay`
Located at [LoadingOverlay.jsx](file:///c:/Users/prasa/OneDrive/Desktop/Shift944/frontend/src/components/ui/LoadingOverlay.jsx).
- Full-card loading indicator overlay.
- **Props**: `message`.

### 9. `PageHeader`
Located at [PageHeader.jsx](file:///c:/Users/prasa/OneDrive/Desktop/Shift944/frontend/src/components/ui/PageHeader.jsx).
- Displays page title, description, and action buttons.

### 10. `ConfirmDialog`
Located at [ConfirmDialog.jsx](file:///c:/Users/prasa/OneDrive/Desktop/Shift944/frontend/src/components/ui/ConfirmDialog.jsx).
- A specialized confirmation dialog built on top of `Modal`.
- **Props**: `isOpen`, `onClose`, `onConfirm`, `title`, `description`, `confirmText`.

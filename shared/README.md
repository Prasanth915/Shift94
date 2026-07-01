# @shift9/shared

The **Shared Module** serves as the central, framework-independent library for the Shift 9 application. It contains resources that are used by both the React frontend and the Express backend.

## Directory Structure

```
shared/
├── constants/     # Global strings, error messages, and success messages
├── enums/         # Mapping of platform states, publishing statuses, and environments
├── helpers/       # Utility functions for strings, dates, and response parsing
├── types/         # JSDoc type definitions for API payloads and DTOs
└── validators/    # Regular expressions and payload check utilities
```

## Reusability & Guidelines

### 1. Framework Independence
- Code in this directory **must not** import or rely on Node-specific APIs (like `fs`, `path`, or `crypto`) or browser-specific APIs (like `window`, `document`, or React hooks).
- Keeping this module pure allows it to be compiled and bundled seamlessly into both the frontend Vite build and the backend Node.js runtime.

### 2. Validation
- Frontend forms (`react-hook-form`) and backend middleware (`express-validator`) should import and reference the regular expressions (`EMAIL_REGEX`, `URL_REGEX`) and validators defined here to ensure consistent validation rules on both sides of the network.

### 3. Usage Example

#### Import in Frontend (React)
```javascript
import { Platform, formatDate } from '@shift9/shared';

const DisplayDate = ({ date }) => {
  return <span>{formatDate(date)}</span>;
};
```

#### Import in Backend (Express)
```javascript
import { Platform, PublishStatus } from '@shift9/shared';

// Use enums for business logic
if (log.status === PublishStatus.PUBLISHED) {
  // ...
}
```

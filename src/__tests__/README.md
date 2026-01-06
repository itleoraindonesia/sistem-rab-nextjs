# Test Documentation for EditRABPage

## Overview
This directory contains test specifications for the EditRABPage component.

## Test Structure

### File: `app/(protected)/rab/edit/[id]/page.test.tsx`

**Component:** `src/app/(protected)/rab/edit/[id]/page.tsx`

**Test Coverage:**
1. **Loading State** - Renders LoadingState when hook returns loading: true
2. **Error State** - Renders ErrorState when hook returns error
3. **Success State** - Renders FormRAB when data loads successfully
4. **Hook Integration** - Calls useRABEdit with correct id from useParams
5. **Props Passing** - Passes all hook return values to FormRAB component

## Setup Requirements

To run these tests, install testing dependencies:

```bash
pnpm add -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest
```

Add to `package.json`:
```json
{
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"]
  }
}
```

Create `jest.setup.js`:
```javascript
import '@testing-library/jest-dom';
```

## Test Implementation

```typescript
import { render, screen } from '@testing-library/react';
import EditRABPage from '../../../../app/(protected)/rab/edit/[id]/page';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('../../../../hooks/useRABEdit');
jest.mock('../../../../components/form/LoadingState');
jest.mock('../../../../components/form/ErrorState');
jest.mock('../../../../components/form/FormRAB');

describe('EditRABPage', () => {
  it('renders loading state when loading', () => {
    // Mock useRABEdit to return loading: true
    render(<EditRABPage />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders form when data loaded', () => {
    // Mock useRABEdit to return success data
    render(<EditRABPage />);
    expect(screen.getByTestId('form-rab')).toBeInTheDocument();
  });
});
```

## Key Testing Points

- **Conditional Rendering**: Loading → Error → Success states
- **Hook Parameter**: Correct id passed to useRABEdit
- **Props Mapping**: All hook returns passed to FormRAB
- **Component Integration**: Proper mocking of external dependencies

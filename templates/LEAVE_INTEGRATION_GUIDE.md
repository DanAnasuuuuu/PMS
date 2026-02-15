# Leave Management Component Integration Guide

## Overview
The `LeavesManagement.tsx` file contains a complete, production-ready leave management system with:
- **AddLeaveModal**: Form to create new leave requests
- **LeavesView**: Table view with approve/reject/cancel actions
- **Status filtering**: Filter leaves by status (Pending, Approved, etc.)
- **Rejection modal**: Prompt for rejection reason

## Integration Steps

### 1. Import the Component
In your `App.tsx`, add this import at the top:

```typescript
import { LeavesView } from './LeavesManagement';
```

### 2. Replace the Existing LeavesView
Find the line where you render `LeavesView` (around line 1178):

```typescript
{activeTab === 'leaves' && <LeavesView leaves={mockLeaves} personnel={personnelData} />}
```

Replace it with:

```typescript
{activeTab === 'leaves' && <LeavesView personnel={personnelData} />}
```

### 3. Pass ThemeContext (Important!)
The component uses `ThemeContext` from your App.tsx. Make sure it's exported or the component is rendered within the ThemeContext.Provider.

**Option A - Export ThemeContext** (Recommended):
In `App.tsx`, change line 29 from:
```typescript
const ThemeContext = createContext({ isDarkMode: false, toggleTheme: () => { } });
```

To:
```typescript
export const ThemeContext = createContext({ isDarkMode: false, toggleTheme: () => { } });
```

Then in `LeavesManagement.tsx` line 7, change from:
```typescript
const ThemeContext = React.createContext({ isDarkMode: false });
```

To:
```typescript
import { ThemeContext } from './App';
```

**Option B - Keep as is**:
The component will work but won't respond to theme changes. The dark mode toggle won't affect it.

## Features

### For Users:
- ✅ Create leave requests with personnel selection, leave type, dates, and reason
- ✅ View all leaves in a table with filtering by status
- ✅ See leave details: personnel, type, dates, days count, status

### For Approvers:
- ✅ Approve pending leaves with one click
- ✅ Reject leaves with mandatory reason input
- ✅ Cancel pending or approved leaves

### API Integration:
- ✅ Fetches leaves from `/api/leaves/`
- ✅ Creates leaves via `/api/leaves/`
- ✅ Approves via `/api/leaves/{id}/approve/`
- ✅ Rejects via `/api/leaves/{id}/reject/`
- ✅ Cancels via `/api/leaves/{id}/cancel/`

## Testing

After integration, test these scenarios:

1. **Create Leave**: Click "New Leave Request" → Fill form → Submit
2. **Approve Leave**: Find pending leave → Click green checkmark
3. **Reject Leave**: Find pending leave → Click red X → Enter reason → Reject
4. **Cancel Leave**: Find pending/approved leave → Click "Cancel" → Confirm
5. **Filter**: Use status dropdown to filter leaves

## Troubleshooting

**Error: "Cannot find module './LeavesManagement'"**
- Make sure the file is in `/home/kali/Documents/PMS/templates/`

**Error: "ThemeContext is not defined"**
- Follow Option A in step 3 above to export ThemeContext

**Leaves not loading:**
- Run migrations first: `./migrate_leave.sh`
- Check browser console for API errors
- Verify backend is running: `sudo docker-compose ps`

**Styling looks wrong:**
- Ensure Tailwind CSS is configured in your project
- The component uses the same color scheme as your existing app

## Next Steps

1. Run database migrations: `./migrate_leave.sh`
2. Integrate the component following steps above
3. Test the functionality
4. Optionally customize colors/styling to match your preferences

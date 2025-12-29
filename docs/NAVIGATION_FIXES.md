# Navigation & Dashboard Fixes

## Issues Fixed

### 1. ✅ Plugin Permissions Iteration Error

**Problem**: "sugar hooks is not iterable" error when loading plugin permissions

**Root Cause**: Plugin dashboard was parsing hooks in the old format, but hooks now use a new array-based format with matchers.

**Fix**: Updated `plugin-dashboard.js` lines 502-535 to handle both formats:

- **New format**: Array of matchers with nested hooks arrays
- **Old format**: Direct hook objects (backward compatibility)

```javascript
// New format handling:
for (const [event, matchers] of Object.entries(hooksData.hooks || {})) {
  if (Array.isArray(matchers)) {
    for (const matcher of matchers) {
      if (matcher.hooks && Array.isArray(matcher.hooks)) {
        // Process each hook in the matcher
      }
    }
  }
}
```

### 2. ✅ Navigation Routing to Unavailable Pages

**Problem**: Clicking navigation links led to error pages when dashboards weren't running

**Fixes**:

1. **Offline Detection**: Navigation now checks if dashboards are running using HEAD requests with 2s timeout
2. **Click Prevention**: Offline dashboards show alert instead of navigating
3. **Visual Indicators**:
   - Red dot indicator on offline dashboards
   - Grayscale icon filter
   - Reduced opacity (40%)
   - Hover shows error message

**Updated Files**:

- `shared/navigation.js` - Better status checking (lines 194-230)
- `shared/navigation.css` - Visual offline indicators (lines 318-341)

### 3. ✅ Better Error Handling

**Improvements**:

- Fetch requests now use AbortController with 2s timeout
- HEAD requests instead of GET for faster checks
- Clear error messages when clicking offline dashboards
- Graceful degradation when dashboards unavailable

## Testing Guide

### Test 1: Plugin Permissions Loading

```bash
# Start plugin dashboard
cct --plugins

# Check browser console - should see no iteration errors
# Navigate to Permissions tab - should display hooks correctly
```

### Test 2: Navigation Between Dashboards

```bash
# Start only hooks dashboard
cct --hooks

# In browser:
# - Hooks link should be highlighted (active)
# - Other links should show red dot (offline)
# - Clicking offline link shows alert
# - Clicking won't navigate to error page
```

### Test 3: Multiple Dashboards Running

```bash
# Terminal 1
cct --hooks

# Terminal 2
cct --plugins

# Terminal 3
cct --skills

# In browser:
# - All 3 dashboards should NOT have red dot
# - Clicking should navigate smoothly
# - Scope preserved across navigation
```

### Test 4: Scope Switching

```bash
# Start any dashboard
cct --hooks

# In browser:
# 1. Change scope to "User"
# 2. Data should reload
# 3. Click "Plugins" in navigation
# 4. Should navigate with ?scope=user
# 5. Plugins dashboard shows user scope data
```

## Files Modified

1. **cli-tool/src/plugin-dashboard.js**
   - Fixed hooks iteration for new format
   - Backward compatibility with old format

2. **cli-tool/src/shared/navigation.js**
   - Improved dashboard status checking
   - Added offline click prevention
   - Better timeout handling

3. **cli-tool/src/shared/navigation.css**
   - Visual offline indicators
   - Red dot badge
   - Grayscale filter
   - Hover effects

## Known Limitations

1. **Dashboard Detection**: Uses HEAD requests which may fail with strict CORS
2. **Port Hardcoding**: Dashboard ports are hardcoded (3333, 3335, 3336, 3337, 3338)
3. **No Auto-Retry**: Status check happens once on load, doesn't retry automatically

## Future Improvements

- [ ] Add WebSocket for real-time dashboard status
- [ ] Auto-refresh status every 30 seconds
- [ ] Show "Start Dashboard" button for offline dashboards
- [ ] Persist dashboard preferences in localStorage
- [ ] Add notification when dashboard comes online

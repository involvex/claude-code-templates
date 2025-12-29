# Claude Code Templates v1.22.0 - New Features

## 🎉 Major Features Released

This release introduces a comprehensive dashboard system with unified navigation, scope management, and performance improvements.

---

## 1. 🎛️ Unified Dashboard (`--dashboard`)

### What It Does

Provides a single interface to access ALL Claude Code dashboards without restarting.

### Usage

```bash
# Launch unified dashboard (opens to analytics by default)
cct --dashboard

# Opens at http://localhost:3339
```

### Features

- **Dashboard Selector**: Dropdown to switch between all dashboards
- **Status Indicators**: Real-time online/offline status for each dashboard
- **Seamless Navigation**: Switch dashboards without page reloads
- **Scope Preservation**: Maintains your selected scope across switches
- **Error Handling**: Clear messages when dashboards aren't running

### Example Workflow

```bash
# Terminal 1: Start multiple dashboards
cct --hooks &
cct --plugins &
cct --skills &

# Terminal 2: Start unified dashboard
cct --dashboard

# In browser:
# - All dashboards show as "online" (no red dot)
# - Switch between them using dropdown
# - Scope changes apply across all dashboards
```

---

## 2. 📍 Scope System (`--scope`)

### What It Does

Control where components are installed: user-global, project-shared, or local-only.

### Usage

```bash
# Install to user scope (available in all projects)
cct --agent security-auditor --scope user

# Install to project scope (default, shared with team)
cct --command lint --scope project

# Install to local scope (machine-specific, not committed)
cct --setting read-only-mode --scope local

# Batch installation with scope
cct --agent frontend-dev --command lint --mcp github --scope user
```

### Scope Hierarchy

| Scope          | Location                 | Git       | Use Case                             |
| -------------- | ------------------------ | --------- | ------------------------------------ |
| **User**       | `~/.claude/`             | N/A       | Personal tools, available everywhere |
| **Project**    | `./.claude/`             | Committed | Team-shared configurations           |
| **Local**      | `./.claude/*.local.json` | Ignored   | Machine-specific settings            |
| **Enterprise** | System-wide              | N/A       | Organization-wide (admin only)       |

### Dashboard Scope Switching

All dashboards now include a scope dropdown:

1. Select scope from dropdown (User/Project/Local/All)
2. Data reloads automatically for that scope
3. Scope preserved when navigating between dashboards
4. URL updates: `?scope=user`

---

## 3. 🪝 Hooks Dashboard (`--hooks`)

### What It Does

View, manage, and monitor all Claude Code automation hooks across scopes.

### Usage

```bash
# Launch hooks dashboard
cct --hooks

# With scope filter
cct --hooks --scope user

# Custom host/port
cct --hooks --host 0.0.0.0 --port 8080
```

### Features

- **Hook Inventory**: View all installed hooks
- **Available Hooks**: Browse hooks from components library
- **Scope Filtering**: Filter by user/project/local
- **Event Types**: Group by PreToolUse, PostToolUse, Stop, etc.
- **Search**: Real-time search by name, description, event
- **Installation**: Copy commands to install hooks

### Supported Hook Formats

✅ **New Array-Based Format**:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*.js",
        "hooks": [{ "type": "bash", "command": "eslint" }]
      }
    ]
  }
}
```

✅ **Old Direct Format** (backward compatible):

```json
{
  "hooks": {
    "PreToolUse": [{ "type": "bash", "command": "eslint" }]
  }
}
```

---

## 4. 🧭 Universal Navigation

### What It Does

Adds persistent navigation bar to all dashboards with offline detection.

### Features

- **Dashboard Links**: 📊 Analytics | 💬 Chats | 🔌 Plugins | 🎯 Skills | 🪝 Hooks
- **Active State**: Orange underline on current dashboard
- **Offline Detection**: Red dot (●) on unavailable dashboards
- **Scope Selector**: Unified scope switching
- **Click Prevention**: Alerts when clicking offline dashboards
- **Mobile Responsive**: Hamburger menu for small screens

### Visual Indicators

```
🔌 Plugins         (Online, clickable)
🔌 Plugins ●       (Offline, shows alert)
🔌 Plugins         (Active, orange underline)
     ̲ ̲ ̲ ̲ ̲ ̲ ̲
```

### How It Works

- Automatically checks dashboard availability on load
- HEAD requests with 2-second timeout
- Prevents navigation to offline dashboards
- Preserves scope when navigating

---

## 5. ⚡ Bun Integration

### What It Does

Automatic package manager detection with intelligent fallback.

### Usage

```bash
# Check detected package manager
npm run pm:detect

# Check Bun availability
npm run bun:check

# Install with Bun (if available)
npm run bun:install
```

### How It Works

1. Detects Bun at runtime
2. Uses Bun if available (~3x faster)
3. Falls back to npm automatically
4. No configuration required
5. No breaking changes

### Performance Benefits

- **Bun**: 2-3x faster npm installs
- **npm**: Full compatibility maintained
- **Vercel**: Build command tries Bun first: `bun run build || npm run build`

### Automatic in CLI

```javascript
// CLI automatically detects and uses best package manager
const pm = await detectPackageManager();
// Uses Bun if available, npm otherwise
```

---

## 6. 🔧 Configurable Server Options

### What It Does

Customize dashboard host and port for any use case.

### Usage

```bash
# Custom host for network access
cct --hooks --host 0.0.0.0

# Custom port
cct --analytics --port 8080

# Both
cct --dashboard --host 0.0.0.0 --port 3000
```

### Use Cases

- **Development**: Custom ports to avoid conflicts
- **Network Access**: Host on 0.0.0.0 for team access
- **Production**: Specific ports for deployment
- **Testing**: Different ports for parallel instances

---

## 🚀 Quick Start Guide

### Scenario 1: Personal Development Setup

```bash
# Install your favorite tools globally
cct --agent frontend-dev --scope user
cct --agent security-auditor --scope user
cct --command lint --scope user

# Launch unified dashboard
cct --dashboard

# All tools available in every project!
```

### Scenario 2: Team Project Setup

```bash
# Install project-wide tools
cct --agent code-reviewer --scope project
cct --hook pre-commit --scope project

# Team members see same tools
git commit .claude/  # Commit configurations
```

### Scenario 3: Machine-Specific Settings

```bash
# Install local-only preferences
cct --setting performance-mode --scope local

# Not committed to git
# Machine-specific optimizations
```

### Scenario 4: Multi-Dashboard Workflow

```bash
# Terminal 1: Start dashboards
cct --hooks &
cct --plugins &
cct --skills &

# Terminal 2: Unified interface
cct --dashboard

# Switch between them seamlessly!
```

---

## 📊 Dashboard Port Reference

| Dashboard   | Port     | Command            | Description                  |
| ----------- | -------- | ------------------ | ---------------------------- |
| Analytics   | 3333     | `--analytics`      | Session monitoring & metrics |
| Chats       | 3335     | `--chats`          | Mobile-first chat interface  |
| Plugins     | 3336     | `--plugins`        | Plugin management            |
| Skills      | 3337     | `--skills-manager` | Skills browser               |
| Hooks       | 3338     | `--hooks`          | Automation hooks             |
| **Unified** | **3339** | `--dashboard`      | **All-in-one interface**     |

---

## 🐛 Bug Fixes

### Plugin Permissions Iteration Error

**Fixed**: "sugar hooks is not iterable" error

**Problem**: Plugin dashboard couldn't parse new array-based hook format

**Solution**: Updated to handle both old and new hook formats with backward compatibility

### Navigation Routing Errors

**Fixed**: Clicking navigation links led to error pages

**Problem**: No detection of dashboard availability

**Solution**:

- Added offline detection with visual indicators
- Click prevention with helpful alerts
- Grayscale + red dot for offline dashboards

---

## 📚 Documentation Updates

All new features are documented in:

- ✅ `CLAUDE.md` - Complete technical documentation
- ✅ `NAVIGATION_FIXES.md` - Bug fixes and testing guide
- ✅ `NEW_FEATURES_v1.22.0.md` - This file!

---

## 🧪 Testing Guide

### Test 1: Scope Installation

```bash
# Install to different scopes
cct --agent test-agent --scope user
cct --agent test-agent --scope project
cct --agent test-agent --scope local

# Verify locations:
# User: ~/.claude/agents/test-agent.md
# Project: ./.claude/agents/test-agent.md
# Local: ./.claude/agents/test-agent.md (settings.local.json)
```

### Test 2: Dashboard Navigation

```bash
# Start single dashboard
cct --hooks

# In browser:
# ✅ Hooks is active (orange underline)
# ✅ Other dashboards show red dot
# ✅ Clicking offline shows alert
# ✅ No error pages!
```

### Test 3: Unified Dashboard

```bash
# Start dashboards
cct --hooks &
cct --plugins &

# Start unified
cct --dashboard

# In browser:
# ✅ Dropdown shows both online
# ✅ Switch between them
# ✅ Scope preserved
```

### Test 4: Bun Integration

```bash
# Check detection
npm run pm:detect
# Should show: Bun v1.x.x (or npm v10.x.x)

# Verify in use
cct --agent test --verbose
# Should log: "Using package manager: bun"
```

---

## 🎯 Migration Guide

### From v1.21.x to v1.22.0

**No Breaking Changes!** All existing functionality preserved.

**New Capabilities:**

1. Add `--scope` to your installation commands
2. Use `--dashboard` for unified interface
3. Navigate between dashboards without restarting
4. Bun works automatically if installed

**Recommended Actions:**

```bash
# 1. Update to latest
npm install -g claude-code-templates@latest

# 2. Try unified dashboard
cct --dashboard

# 3. Install Bun for performance (optional)
curl -fsSL https://bun.sh/install | bash

# 4. Reorganize components by scope
cct --agent your-agent --scope user  # If personal
cct --agent team-agent --scope project  # If shared
```

---

## 🔮 What's Next

Future improvements being considered:

- [ ] WebSocket for real-time dashboard status
- [ ] Auto-refresh dashboard availability
- [ ] "Start Dashboard" buttons for offline dashboards
- [ ] localStorage for dashboard preferences
- [ ] Notification when dashboard comes online
- [ ] Export/import scope configurations
- [ ] Scope comparison tool

---

## 📞 Support

- **Repository**: https://github.com/involvex/claude-code-templates
- **Issues**: https://github.com/involvex/claude-code-templates/issues
- **Documentation**: See `CLAUDE.md` for technical details
- **Help**: Run `cct --help` for all commands

---

**Version**: 1.22.0
**Release Date**: 2025-12-29
**Author**: involvex
**Status**: Production Ready ✅

# Code Quality & CI/CD Setup

**Author**: involvex
**Version**: 1.22.0
**Date**: 2025-12-29

## Overview

This document outlines the comprehensive code quality and CI/CD enhancements added to the claude-code-templates project.

---

## 📋 What's Been Added

### 1. **Linting & Formatting**

#### ESLint Configuration

- **File**: `.eslintrc.json` (root and cli-tool)
- **Purpose**: JavaScript/TypeScript code linting with Node.js best practices
- **Features**:
  - ESLint recommended rules
  - Node.js plugin for server-side best practices
  - Prettier integration (no conflicts)
  - Ignores components and templates (preserve original formatting)

```json
{
  "extends": ["eslint:recommended", "plugin:node/recommended", "prettier"]
}
```

#### Prettier Configuration

- **File**: `.prettierrc.json` (root and cli-tool)
- **Purpose**: Consistent code formatting across the project
- **Settings**:
  - Single quotes
  - 2-space indentation
  - 100 character line width
  - Trailing commas (ES5)
  - LF line endings

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## 🛠️ NPM Scripts

### Root Package (`package.json`)

```bash
# Linting
npm run lint              # Check for linting errors
npm run lint:fix          # Auto-fix linting issues

# Formatting
npm run format            # Format all files
npm run format:check      # Check formatting without changes

# Validation (runs both)
npm run validate          # Run format:check + lint

# Build hooks
npm run prebuild          # Auto-runs before build
npm run prepublishOnly    # Auto-runs before publish
```

### CLI Tool Package (`cli-tool/package.json`)

Same scripts as root, plus:

```bash
npm run build             # Build the CLI tool
npm run security-audit    # Run security audit
npm run test              # Run tests
```

---

## 🔄 Pre-Build & Pre-Publish Hooks

### Automatic Quality Checks

**Before every build** (`prebuild`):

1. ✅ Format check
2. ✅ Linting

**Before every publish** (`prepublishOnly`):

1. ✅ Format check
2. ✅ Linting
3. ✅ Build validation

This ensures that **no code gets published without passing quality checks**.

---

## 📦 Manual Publishing

**Note**: Automated workflows are **disabled** (`.disabled` extension). All publishing is done manually for full control.

### Available Workflows (Disabled by Default)

**Code Quality Workflow**: `.github/workflows/code-quality.yml.disabled`

- Can be enabled by removing `.disabled` extension
- Runs format/lint/build checks on PRs

**Publish Workflow**: `.github/workflows/publish-package.yml.disabled`

- Can be enabled by removing `.disabled` extension
- Automated package publishing to GitHub Packages

**To enable**: Rename `*.yml.disabled` to `*.yml`

### Manual Publishing Steps

```bash
# 1. Ensure code quality
npm run validate          # Format + lint check
npm run build            # Build validation

# 2. Version bump (choose one)
npm version patch        # 1.0.0 → 1.0.1
npm version minor        # 1.0.0 → 1.1.0
npm version major        # 1.0.0 → 2.0.0

# 3. Publish to npm
npm publish

# 4. Push changes
git push --follow-tags
```

---

## 📁 File Structure

```
.
├── .eslintrc.json              # Root ESLint config
├── .prettierrc.json            # Root Prettier config
├── .prettierignore             # Prettier ignore patterns
├── package.json                # Root package with scripts
├── cli-tool/
│   ├── .eslintrc.json          # CLI-specific ESLint
│   ├── .prettierrc.json        # CLI-specific Prettier
│   ├── .prettierignore         # CLI ignore patterns
│   └── package.json            # CLI package with scripts
└── .github/
    └── workflows/
        ├── code-quality.yml    # NEW: Quality checks
        └── publish-package.yml # Enhanced with validation
```

---

## 🚀 Developer Workflow

### Local Development

```bash
# Before committing
npm run format        # Format all code
npm run lint:fix      # Fix linting issues

# Or run both at once
npm run validate

# Before building
npm run build         # Auto-runs prebuild (validation)

# Before publishing
npm publish           # Auto-runs prepublishOnly (validation + build)
```

### Manual Publishing Flow

```
┌─────────────────────┐
│  Local Development  │
│  ✓ Write Code       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Quality Checks     │
│  npm run validate   │
│  npm run build      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Version Bump       │
│  npm version patch  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Manual Publish     │
│  npm publish        │
│  git push --tags    │
└─────────────────────┘
```

**Note**: Automated workflows disabled for full manual control.

---

## 🔧 Configuration Details

### ESLint Rules

**Enabled**:

- `eslint:recommended` - Standard best practices
- `plugin:node/recommended` - Node.js specific rules
- `prettier` - Prevents conflicts with Prettier

**Custom Rules**:

- `no-console: off` - Allow console.log in CLI tool
- `no-unused-vars: warn` - Warn instead of error
- Ignore variables/args starting with `_`

### Prettier Overrides

**JSON Files**:

- 80 character line width (narrower for readability)

**Markdown Files**:

- `proseWrap: preserve` - Don't wrap lines

### Ignored Paths

Both ESLint and Prettier ignore:

- `node_modules/`
- `dist/`, `build/`
- `components/**` (preserve original formatting)
- `templates/**` (preserve original formatting)
- Generated files (`.min.js`, JSON data)

---

## 📊 Quality Metrics

### Before Enhancement

- ❌ No formatting standards
- ❌ No linting
- ❌ No pre-publish validation
- ❌ Manual code review only

### After Enhancement

- ✅ Automated formatting (Prettier)
- ✅ Automated linting (ESLint)
- ✅ Pre-build validation (hooks)
- ✅ Pre-publish validation (hooks)
- ✅ CI/CD quality gates
- ✅ PR feedback automation

---

## 🎯 Benefits

### For Developers

1. **Consistency**: Same code style across entire project
2. **Fast Feedback**: Issues caught locally before pushing
3. **Auto-Fix**: Many issues fixed automatically
4. **Clear Standards**: ESLint/Prettier configs define expectations

### For CI/CD

1. **Quality Gates**: Nothing merges without passing checks
2. **Automated Reviews**: PR comments with fix instructions
3. **Security**: npm audit runs on every PR
4. **Build Confidence**: Syntax validation before publish

### For Project

1. **Maintainability**: Consistent code easier to maintain
2. **Onboarding**: New contributors follow standards automatically
3. **Professional**: Production-ready code quality
4. **Trust**: Published packages are validated

---

## 🔍 Testing the Setup

### Test Format Check

```bash
# Check if files are formatted correctly
npm run format:check

# Format all files
npm run format

# Verify formatting
npm run format:check
# Should show: "All matched files use Prettier code style!"
```

### Test Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix issues
npm run lint:fix

# Verify no errors
npm run lint
# Should show: "✓ No ESLint warnings or errors"
```

### Test Pre-Build Hook

```bash
# This should auto-run validation before building
npm run build

# If there are errors, build fails with:
# "Error: prebuild failed"
```

### Test Pre-Publish Hook

```bash
# Simulate publish (dry run)
npm publish --dry-run

# Should run:
# 1. prepublishOnly (validation + build)
# 2. Package creation
# 3. Show what would be published
```

---

## 🐛 Troubleshooting

### Issue: Linting fails with "Parsing error"

**Solution**: Check that ESLint config is valid JSON and dependencies are installed:

```bash
npm install
# or
cd cli-tool && npm install
```

### Issue: Prettier format check fails

**Solution**: Run format to fix all files:

```bash
npm run format
```

### Issue: Pre-build hook prevents building

**Solution**: Fix validation errors first:

```bash
npm run validate
# Fix reported issues
npm run build
```

### Issue: CI workflow fails but local works

**Solution**: Ensure you're using the same Node version as CI (18.x):

```bash
node --version  # Should be v18.x or higher
```

---

## 📚 Best Practices

### When Writing Code

1. Run `npm run format` before committing
2. Run `npm run lint:fix` to auto-fix issues
3. Check `npm run validate` passes before pushing

### When Creating PRs

1. Ensure CI passes before requesting review
2. Address any auto-comments from workflows
3. Run validation locally first

### When Publishing

1. Let `prepublishOnly` hook handle validation
2. Don't skip hooks with `--no-verify`
3. Monitor npm audit warnings

---

## 🔄 Future Enhancements

Potential improvements:

- [ ] Add Husky for git hooks (pre-commit, pre-push)
- [ ] Add lint-staged for faster pre-commit checks
- [ ] Add TypeScript support with TSLint
- [ ] Add commit message linting (commitlint)
- [ ] Add dependency update automation (Dependabot)
- [ ] Add automated changelog generation
- [ ] Add code coverage thresholds in CI
- [ ] Add performance budgets for bundle size

---

## 📞 Support

**Repository**: https://github.com/involvex/claude-code-templates
**Issues**: https://github.com/involvex/claude-code-templates/issues
**Author**: involvex

---

**Status**: ✅ Production Ready
**Last Updated**: 2025-12-29

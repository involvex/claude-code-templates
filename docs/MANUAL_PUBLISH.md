# Manual Publishing Guide

**Author**: involvex
**Repository**: https://github.com/involvex/claude-code-templates

---

## 📦 Publishing Philosophy

**All publishing is manual** to maintain full control over releases. Automated workflows are disabled by default.

---

## 🚀 Pre-Publish Checklist

Before publishing, ensure:

- [ ] All features tested locally
- [ ] Code formatted: `npm run format`
- [ ] Linting passed: `npm run lint:fix`
- [ ] Build succeeds: `npm run build`
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (if applicable)
- [ ] Git status clean or changes committed

---

## 📋 Publishing Steps

### 1. **Validate Code Quality**

```bash
# Run all quality checks
npm run validate

# Or individually:
npm run format:check     # Check formatting
npm run lint             # Check linting
npm run build           # Validate build
```

### 2. **Version Bump**

Choose the appropriate version bump:

```bash
# Patch (bug fixes): 1.0.0 → 1.0.1
npm version patch

# Minor (new features): 1.0.0 → 1.1.0
npm version minor

# Major (breaking changes): 1.0.0 → 2.0.0
npm version major

# Specific version
npm version 1.5.0
```

**This automatically**:
- Updates `package.json` version
- Creates git commit: "1.5.0"
- Creates git tag: "v1.5.0"
- Runs `prepublishOnly` hook (validation + build)

### 3. **Publish to npm**

```bash
# Publish to npm registry
npm publish

# Or with tag
npm publish --tag beta
npm publish --tag latest
```

### 4. **Push to GitHub**

```bash
# Push commits and tags
git push --follow-tags

# Or separately
git push origin main
git push --tags
```

---

## 📦 Publishing Scopes

### npm Registry (Public)

```bash
# Standard publish (as claude-code-templates)
npm publish
```

### GitHub Packages (Optional)

```bash
# Update package.json temporarily
npm pkg set name="@involvex/claude-code-templates"
npm pkg set publishConfig.registry="https://npm.pkg.github.com"

# Publish
npm publish --registry=https://npm.pkg.github.com

# Revert package.json
git checkout package.json
```

---

## 🔄 CLI Tool Publishing

For the CLI tool specifically:

```bash
cd cli-tool

# Validate
npm run validate

# Version bump
npm version patch

# Publish
npm publish

# Return to root
cd ..
```

---

## 🛡️ Pre-Publish Hooks

The following hooks run **automatically** before publishing:

### `prepublishOnly` Hook

Runs before `npm publish`:

1. ✅ `npm run validate`
   - Format check
   - Linting
2. ✅ `npm run build`
   - Build validation

**If any step fails, publish is aborted.**

### Override (Not Recommended)

```bash
# Skip hooks (dangerous!)
npm publish --ignore-scripts

# Only use if hooks are broken and you need emergency publish
```

---

## 📊 Version Strategy

### Semantic Versioning (SemVer)

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)
- **MINOR**: New features, backward compatible (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes, backward compatible (1.0.0 → 1.0.1)

### Examples

```bash
# Bug fix
npm version patch
# 1.21.14 → 1.21.15

# New feature (scope system, hooks dashboard)
npm version minor
# 1.21.14 → 1.22.0

# Breaking change (API change, removed features)
npm version major
# 1.21.14 → 2.0.0
```

---

## 🧪 Test Before Publishing

### Dry Run

```bash
# See what would be published
npm publish --dry-run

# Check package contents
npm pack
tar -tzf claude-code-templates-*.tgz
```

### Local Install Test

```bash
# Pack the package
npm pack

# Install globally from tarball
npm install -g ./claude-code-templates-1.22.0.tgz

# Test it
cct --help
cct --dashboard

# Uninstall
npm uninstall -g claude-code-templates
```

---

## 📝 Post-Publish Checklist

After successful publish:

- [ ] Verify package on npm: https://www.npmjs.com/package/claude-code-templates
- [ ] Test installation: `npm install -g claude-code-templates@latest`
- [ ] Create GitHub release (optional)
- [ ] Update website (aitmpl.com) if needed
- [ ] Announce in Discord/community (optional)

---

## 🐛 Troubleshooting

### "Need to login to npm"

```bash
npm login
# Enter credentials
npm whoami  # Verify logged in
```

### "Package already exists at this version"

```bash
# Bump version again
npm version patch
npm publish
```

### "Pre-publish validation failed"

```bash
# Fix formatting
npm run format

# Fix linting
npm run lint:fix

# Try again
npm publish
```

### "Permission denied"

```bash
# Verify package ownership
npm owner ls claude-code-templates

# Add yourself if needed
npm owner add yourusername claude-code-templates
```

---

## 🔒 Security

### .npmrc Configuration

```bash
# Never commit .npmrc with tokens!
echo ".npmrc" >> .gitignore

# Use npm token for CI (if needed)
npm token create --read-only
```

### Two-Factor Authentication

Enable 2FA on npm account:
- Settings → Account → Two-Factor Authentication
- Use for auth and publishing

---

## 📞 Support

**Issues**: https://github.com/involvex/claude-code-templates/issues
**Author**: involvex

---

**Last Updated**: 2025-12-29

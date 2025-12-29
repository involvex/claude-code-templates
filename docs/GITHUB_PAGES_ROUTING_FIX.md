# GitHub Pages Routing Fix

## Problem

The documentation site deployed on GitHub Pages at `https://involvex.github.io/claude-code-templates/` had routing issues where the router was incorrectly redirecting pages to `https://involvex.github.io/agents` instead of the appropriate documentation routes within the subdirectory.

## Root Causes Identified

1. **Jekyll Configuration**: The `_config.yml` file had `baseurl: ""` instead of the correct subdirectory path
2. **Routing Logic**: The `stack-router.js` wasn't accounting for the GitHub Pages subdirectory when parsing routes
3. **Hardcoded Navigation Links**: Filter chip links in `index.html` used absolute paths (`/agents`, `/commands`, etc.) instead of relative paths

## Fixes Applied

### 1. Updated Jekyll Configuration (`docs/_config.yml`)

```yaml
# Before
baseurl: ""
url: "https://aitmpl.com"

# After
baseurl: "/claude-code-templates"
url: "https://involvex.github.io"
```

### 2. Fixed Routing Logic (`docs/js/stack-router.js`)

Updated the `handleRouteChange()` method to properly handle the subdirectory path:

```javascript
// For GitHub Pages subdirectory deployment, remove the base path
const basePath = '/claude-code-templates';
const relativePath = path.startsWith(basePath) ? path.substring(basePath.length) : path;

// Check for company routes (/company/epic-games)
const companyMatch = relativePath.match(/^\/company\/([^\/]+)/);
```

### 3. Fixed Navigation Links (`docs/index.html`)

Changed absolute paths to relative paths for filter chips:

```html
<!-- Before -->
<a
  href="/agents"
  class="filter-chip active"
  data-filter="agents"
  onclick="handleFilterClick(event, 'agents')"
>
  <!-- After -->
  <a
    href="./"
    class="filter-chip active"
    data-filter="agents"
    onclick="handleFilterClick(event, 'agents')"
  ></a
></a>
```

Fixed the same issue for all filter chips:

- `/commands` → `./`
- `/settings` → `./`
- `/hooks` → `./`
- `/mcps` → `./`
- `/plugins` → `./`
- `/skills` → `./`
- `/templates` → `./`

### 4. Fixed Sitemap Link

```html
<!-- Before -->
<link rel="sitemap" type="application/xml" href="/sitemap.xml" />

<!-- After -->
<link rel="sitemap" type="application/xml" href="./sitemap.xml" />
```

## Expected Behavior After Fix

- All navigation links will properly stay within the `/claude-code-templates/` subdirectory
- Company stack routes like `/claude-code-templates/company/openai` will work correctly
- Technology stack routes like `/claude-code-templates/technology/react` will work correctly
- Filter chip navigation will update the page content without redirecting to incorrect paths
- The sitemap will be properly linked relative to the deployment directory

## Deployment Notes

These changes ensure that the site will work correctly when:

1. Deployed to GitHub Pages with the docs folder as the source
2. Using the subdirectory path `/claude-code-templates`
3. Accessed via the proper GitHub Pages URL structure

The routing system now properly handles both hash-based routes (`#/company/openai`) and path-based routes (`/claude-code-templates/company/openai`) within the GitHub Pages subdirectory deployment.

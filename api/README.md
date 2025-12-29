# API - Vercel Serverless Functions

Critical infrastructure for claude-code-templates component ecosystem.

## ⚠️ CRITICAL ENDPOINTS

These endpoints are essential for component download metrics. **DO NOT BREAK THEM.**

### `/api/track-download-supabase` 🔴

Tracks every component installation from the CLI tool.

**Used by**: `cli-tool/bin/create-claude-config.js`

**Called on**: Every `--agent`, `--command`, `--mcp`, `--hook`, `--setting`, `--skill` installation

**Database**: Supabase (component_downloads, download_stats)

### `/api/discord/interactions` 🟡

Discord bot for component discovery and search.

**Features**: `/search`, `/info`, `/install`, `/popular`, `/random`

### `/api/claude-code-check` 🟢

Monitors Claude Code releases and sends Discord notifications.

**Frequency**: Every 4 hours (Vercel Cron)

**Database**: Neon (claude_code_versions, claude_code_changes)

## 🧪 Testing

**ALWAYS run tests before deploying:**

```bash
# Run all tests
npm test

# Run only critical endpoint tests
npm run test:api

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## 🚀 Deployment

### Pre-Deployment Checklist

```bash
# 1. Run validation script (from project root)
./scripts/predeploy-check.sh

# 2. If checks pass, deploy
vercel --prod
```

### Manual Deploy Steps

```bash
# 1. Install dependencies
npm install

# 2. Run tests
npm run test:api

# 3. Deploy
cd ..
vercel --prod
```

## 📁 File Structure

```
api/
├── track-download-supabase.js       # Component download tracking (CRITICAL)
├── claude-code-check.js             # Claude Code changelog monitor
├── _parser-claude.js                # Changelog parser utility
├── discord/
│   └── interactions.js              # Discord bot handler
├── claude-code-monitor/
│   ├── README.md                    # Detailed docs
│   ├── check-version.js             # Version checker
│   ├── discord-notifier.js          # Discord notifications
│   ├── parser.js                    # Changelog parser
│   └── webhook.js                   # NPM webhook handler
├── __tests__/
│   └── endpoints.test.js            # Critical endpoint tests
├── jest.config.cjs                  # Jest configuration
├── package.json                     # Dependencies & scripts
└── README.md                        # This file
```

## 🔧 Environment Variables

Required in Vercel Dashboard:

```bash
# Supabase
SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Neon Database
NEON_DATABASE_URL=xxx

# Discord
DISCORD_APP_ID=xxx
DISCORD_BOT_TOKEN=xxx
DISCORD_PUBLIC_KEY=xxx
DISCORD_WEBHOOK_URL_CHANGELOG=xxx
```

## 🐛 Troubleshooting

### Tests Failing?

```bash
# Test against production
API_BASE_URL=https://aitmpl.com npm run test:api

# Check specific endpoint
curl -X POST https://aitmpl.com/api/track-download-supabase \
  -H "Content-Type: application/json" \
  -d '{"type":"agent","name":"test","path":"test/path"}'
```

### Endpoint Not Found After Deploy?

1. Check Vercel function logs: `vercel logs aitmpl.com --follow`
2. Verify file is in `/api` root (not nested)
3. Ensure proper export: `export default async function handler(req, res) {}`

### No Download Tracking Data?

1. Check Vercel logs
2. Verify environment variables are set
3. Test endpoint manually (see above)
4. Check Supabase table: `select * from component_downloads order by created_at desc limit 10;`

## 📊 Monitoring

### Vercel Dashboard

https://vercel.com/dashboard → aitmpl → Functions

### Real-time Logs

```bash
vercel logs aitmpl.com --follow
```

### Database Queries

**Supabase**:

```sql
SELECT type, name, COUNT(*) as downloads
FROM component_downloads
WHERE download_timestamp > NOW() - INTERVAL '7 days'
GROUP BY type, name
ORDER BY downloads DESC;
```

**Neon**:

```sql
SELECT version, published_at, discord_notified
FROM claude_code_versions
ORDER BY published_at DESC;
```

## 🆘 Emergency Rollback

```bash
# 1. List recent deployments
vercel ls

# 2. Promote previous working deployment
vercel promote <previous-deployment-url>
```

## 📖 More Info

See `../CLAUDE.md` section "API Architecture & Deployment" for detailed documentation.

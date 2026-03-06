# Getting Started

You need 8 accounts and about 15 minutes. After that, Claude builds everything autonomously.

---

## Step 1: Install tools

```bash
# Required
node --version    # 20+
pnpm --version    # 9+

# For database verification
psql --version    # any (apt install postgresql-client / brew install libpq)

# For Milestone 1c infrastructure (not needed yet)
aws --version     # v2 (https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
gh --version      # any (apt install gh / brew install gh)
# terraform no longer needed — vendor infrastructure managed by Platform MCP (FTR-106 revised)
```

---

## Step 2: Create accounts (~15 min)

Create these 8 accounts. Keep the tokens somewhere — you'll paste them to Claude in Step 3.

### 1. Neon (database)
- Go to [console.neon.tech](https://console.neon.tech) and sign up
- Don't create a project yet — Claude does that via MCP
- Note your **org API key**: Organization Settings → API Keys → Create

### 2. Contentful (content management)
- Go to [app.contentful.com](https://app.contentful.com) and sign up (free Community tier)
- Create a space (any name — Claude configures the content model)
- Go to Settings → API Keys → Add API Key
- Note three values:
  - **Space ID** (Settings → General Settings)
  - **Content Delivery API access token**
  - **Content Management API personal access token** (Settings → CMA tokens → Generate, then **Authorize** access to your space)

### 3. Voyage AI (embeddings)
- Go to [dash.voyageai.com](https://dash.voyageai.com) and sign up
- Note your **API key**: Dashboard → API Keys

### 4. Sentry (error tracking)
- Go to [sentry.io](https://sentry.io) and sign up (free Developer tier)
- Create a project (choose Next.js if available, otherwise vanilla JavaScript — both work)
- Note two values:
  - **DSN** (shown after project creation, also in Settings → Client Keys)
  - **Auth token**: Settings → Auth Tokens → Create (scopes: project:read, project:write, org:read)

### 5. Vercel (hosting)
- Go to [vercel.com](https://vercel.com) and sign up (free Hobby tier)
- Create an API token: Settings → Tokens → Create
- Note your **API token**
- Don't link the repository yet — Claude handles project setup in Milestone 1c

### 6. New Relic (observability)
- Go to [one.newrelic.com](https://one.newrelic.com) and sign up (free tier)
- Create a **User API key**: API Keys → Create Key (key type: User)
- Note your **API key** (starts with `NRAK-`)
- Claude configures the MCP server for NRQL queries, alerts, and monitoring

### 7. Auth0 (authentication)
- Go to [manage.auth0.com](https://manage.auth0.com) and sign up (free tier)
- Create a tenant (e.g., `yogananda-tech`)
- Go to Applications → Create Application → Machine to Machine
- Authorize access to the Auth0 Management API
- Note three values:
  - **Domain** (e.g., `yogananda-tech.us.auth0.com`)
  - **Client ID**
  - **Client Secret**
- Auth is not used until Milestone 7a+, but provisioning early ensures the tenant exists

### 8. AWS (infrastructure)
- If you don't have an account: [aws.amazon.com](https://aws.amazon.com)
- Configure the CLI: `aws configure` with region `us-west-2`
- Only needed for Milestone 1c deployment — not blocking for Milestone 1a

---

## Step 3: Tell Claude your credentials

Copy this template, fill in your values, and paste it to Claude:

```
Accounts created. Here are my credentials:

Neon org API key: [paste]
Contentful space ID: [paste]
Contentful delivery token: [paste]
Contentful management token: [paste]
Voyage API key: [paste]
Sentry DSN: [paste]
Sentry auth token: [paste]
Vercel API token: [paste]
New Relic API key: [paste]
Auth0 domain: [paste]
Auth0 client ID: [paste]
Auth0 client secret: [paste]
```

**What Claude does with these:**
1. Creates a Neon project via MCP (PostgreSQL 18, pgvector)
2. Creates Contentful content model (Book, Chapter, Section, TextBlock)
3. Fills in `.env.local` with all connection strings and tokens
4. Runs the verification script to confirm everything works

You don't fill `.env.local` yourself. Claude handles it.

---

## Step 4: Verify

```bash
./scripts/verify.sh
```

Green = ready. Claude begins building Milestone 1a.

If anything fails, the script tells you exactly what's wrong.

For write-access testing (creates and immediately deletes test data):
```bash
./scripts/verify.sh --write
```

---

## What happens next

Claude builds Milestone 1a autonomously — no human gates:

1. **Repository setup** — Next.js + TypeScript + Tailwind
2. **Database schema** — 23 tables covering search, content, themes, vocabulary
3. **Contentful content model** — Book → Chapter → Section → TextBlock
4. **English Autobiography ingestion** — 1,568 chunks with Voyage embeddings
5. **Search API** — hybrid vector + full-text with RRF fusion
6. **Search UI** — "What did Yogananda say about..." with verbatim results + "Read in context" links
7. **Book reader** — chapter navigation with prev/next
8. **Search quality evaluation** — 12-query evaluation suite
9. **Operational scripts** — doc-validate, status, release-tag

When you're ready for Milestone 1c (deployment), run:
```bash
./scripts/bootstrap.sh    # Creates AWS infrastructure (~5 min, prompts for 2 credentials)
./scripts/verify.sh       # Confirms everything works
```

---

## Reference docs

These exist for troubleshooting and understanding the system — you don't need to read them to get started:

- [bootstrap-credentials.md](bootstrap-credentials.md) — Complete credential inventory with storage locations
- [manual-steps-milestone-1a.md](manual-steps-milestone-1a.md) — Detailed reference of what `bootstrap.sh` automates
- `.env.example` — Template showing all environment variables

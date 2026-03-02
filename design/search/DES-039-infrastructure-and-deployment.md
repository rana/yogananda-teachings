## DES-039: Infrastructure and Deployment

**Status: Implemented** — see `scripts/bootstrap.sh`, `scripts/deploy.sh`, `scripts/status.sh`, `.github/workflows/ci.yml`

All infrastructure is managed as code per SRF engineering standards. Vendor resources are managed by the yogananda-platform MCP server; one-time AWS security setup uses `bootstrap.sh`. See ADR-016 (revised 2026-03-01).

### Bootstrap: One-Time Security Setup

The portal uses `scripts/bootstrap.sh` for one-time AWS security infrastructure. This creates resources that exist once and rarely change — IAM roles, OIDC federation, KMS keys, Secrets Manager paths, S3 buckets, and DynamoDB tables.

```bash
./scripts/bootstrap.sh
```

The bootstrap script automates all CLI-scriptable setup. The human runs one script, pastes two credentials that require manual console creation (Neon org API key, Sentry auth token), and the script handles everything else. The script is idempotent — safe to re-run.

**What the script creates:**

| Step | Tool | What It Creates | Manual? |
|------|------|----------------|---------|
| 1 | AWS CLI | S3 bucket (`srf-portal-terraform-state`) — versioning, AES-256, public access blocked | No |
| 2 | AWS CLI | DynamoDB table (`srf-portal-terraform-locks`) — `LockID` partition key, on-demand | No |
| 3 | AWS CLI | OIDC provider + IAM role (`portal-ci`) from `terraform/bootstrap/trust-policy.json` | No |
| 4 | Prompt | Neon org API key — console-only, paste when prompted | **Yes** |
| 5 | Prompt | Sentry auth token — console-only, paste when prompted | **Yes** |
| 6 | `gh` CLI | GitHub secrets in batch | No |

**Prerequisites:** AWS CLI configured (`aws configure`), `gh` CLI authenticated, Neon and Sentry accounts exist. See `docs/guides/manual-steps-milestone-1a.md` for the detailed human walkthrough.

**IAM policy documents** are retained in `terraform/bootstrap/`:
- `trust-policy.json` — GitHub OIDC trust policy
- `ci-policy.json` — CI IAM role permissions
- `vercel-trust-policy.json` — Vercel OIDC trust policy
- `vercel-runtime-policy.json` — Vercel runtime IAM permissions

These are reference documents for `bootstrap.sh`, not active Terraform configuration.

### Platform-Managed Infrastructure

Vendor resources (Vercel project, Neon branches, Route 53 records, Contentful environments, Sentry config) are managed by the yogananda-platform MCP server. The teachings app is an application that gets deployed; the platform manages its infrastructure.

**Declarative specification:** `config/projects/teachings.json` in the platform repo describes the project's infrastructure needs — domain, repo, environment chain, gates, vendor project IDs, tier mappings. This serves the same role as `.tf` files: version-controlled, human-readable, machine-executable.

**Three-layer model:**

| Layer | Tool | What It Manages | Frequency |
|-------|------|----------------|-----------|
| **One-time security** | `bootstrap.sh` | IAM, OIDC, KMS, Secrets Manager, S3, DynamoDB | Once at project creation |
| **Vendor resources** | Platform MCP | Vercel project, Neon project/branches, Route 53 DNS, Contentful environments | On onboarding; drift checks as needed |
| **Operational lifecycle** | Platform MCP | Environments, deployments, promotions, health verification | Every deployment cycle |

**Key platform MCP tools for infrastructure:**

| Tool | Purpose |
|------|---------|
| `project_bootstrap` | Create all vendor resources from `teachings.json` config |
| `project_audit` | Compare config against actual vendor state (drift detection) |
| `environment_create` | Create Neon branch + discover Vercel deployment + DNS record |
| `environment_promote` | Move named env pointer, update DNS, enforce gates |
| `environment_destroy` | Clean up Neon branch, DNS, archive in platform DB |
| `deploy_status` | Health check across all vendors for an environment |

### Deployment Model

Vercel builds artifacts from git pushes. The platform decides where those artifacts go live. Auto-production deploy is disabled.

**Build:** Vercel git integration watches GitHub and produces immutable deployment URLs for every push. Preview deployments for PRs are useful for human review.

**Promote:** The platform moves DNS pointers to specific Vercel deployment URLs. For Arc 1 (read-only portal, shared database), promotion is pure DNS — the same artifact serves all environments. For Arc 2+ (environment isolation), the app resolves its environment from the hostname.

**Gate enforcement:** The platform's environment chain (dev → qa → stg → prd) enforces gates:
- dev: automatic (tracks latest main deployment)
- qa: requires CI pass
- stg: requires quality suite pass
- prd: requires stakeholder approval + deployment ceremony

**Rollback:** Promote the previous deployment. DNS pointer swap takes < 5 seconds.

### Two-Layer Neon Management Model

Neon infrastructure is managed through two distinct control planes (revised from three — the former Terraform layer is absorbed by the platform).

| Layer | Tool | What It Manages | Audit Trail |
|-------|------|----------------|-------------|
| **Infrastructure + Operations** | Platform MCP + Neon MCP | Project, branches (persistent and ephemeral), environment isolation, snapshots, schema diffs, connection strings | Platform database (lifecycle) + conversation logs (interactive) |
| **Data** | SQL via `@neondatabase/serverless` + dbmate | Schema migrations, content, queries, extensions | Git (migrations), database WAL |

**Neon MCP as development tool.** The Neon MCP server (`@neondatabase/mcp-server-neon`) is Claude's primary interface for Neon operations during development sessions:

| MCP Tool | Use Case |
|----------|----------|
| `run_sql` | Verify schema after migrations, test queries, inspect data |
| `prepare_database_migration` | Create branch, apply migration SQL, return branch for testing |
| `complete_database_migration` | Apply verified migration to the target branch |
| `compare_database_schema` | Schema diff between branches — drift detection |
| `create_branch` | Ephemeral branches for experimentation |
| `get_connection_string` | Retrieve connection strings for `.env.local` population |
| `describe_branch` | Verify branch state, compute configuration |
| `list_projects` | Verify project exists |

**API key scoping** (see ADR-124 § API Key Scoping Policy):

| Context | Key Type | Scope | Rationale |
|---------|----------|-------|-----------|
| Platform MCP (environment lifecycle) | Project-scoped API key | Single project | Least privilege for branch creation/deletion |
| CI branch operations (`neon-branch.yml`) | Project-scoped API key | Single project | Can create/delete branches but cannot delete the project |
| Claude Code / Neon MCP (interactive) | Project-scoped API key | Single project | Least privilege for interactive operations |

### Boundary: Platform vs. Operations vs. Application Code

| Managed by Platform MCP | Managed by Operations (Neon MCP/CLI) | Managed by Application Code |
|------------------------|--------------------------------------|------------------------------|
| Vendor resource creation (Vercel, Neon, Sentry) | Ephemeral branches (CI, PR, migration test) | Database schema + extensions (dbmate SQL migrations) |
| Persistent branches (production, per named env) | Snapshots (pre-migration, checkpoints) | `sentry.client.config.ts`, `newrelic.js` |
| Environment variables, DNS records | Schema diffs and verification | Lambda handler code (`/lambda/`) |
| Deployment tracking, promotion, health verification | Connection string retrieval | Application routing (`next.config.ts`) |
| Gate enforcement | Time Travel queries (debugging) | CI workflows (`.github/workflows/`) |

### Source Control and CI/CD

| Phase | SCM | CI/CD | Infrastructure State |
|-------|-----|-------|---------------------|
| **Primary (all arcs)** | GitHub | GitHub Actions | Platform database |
| **If SRF requires migration** | GitLab (SRF IDP) | GitLab CI/CD | Platform database (unchanged) |

#### CI/CD Pipeline (GitHub Actions)

```
On every PR:
 1. Lint + type check
 2. Vitest (unit/integration)
 3. axe-core (accessibility)
 4. next build
 5. Playwright (E2E)
 6. Lighthouse CI (performance)
 7. Search quality suite

On merge to main:
 1. All of the above
 2. Neon snapshot (if /migrations/ changed) — pre-migration safety net
 3. dbmate migrate — apply pending migrations
 4. Platform auto-tracks main → dev environment
```

Infrastructure changes no longer trigger a separate CI pipeline. Vendor resources are managed through Platform MCP tool calls, not CI/CD workflows.

**Pre-migration snapshot pattern:** When `/migrations/**` files change, the merge-to-main workflow calls `/scripts/neon-snapshot.sh` to create a snapshot named `pre-migrate-{sha}` before running `dbmate migrate`. If migration fails, restore from the snapshot.

#### Workflow File Structure

```
.github/
 workflows/
   ci.yml              — [1a] App CI: lint, type check, test, build, a11y, Lighthouse, search quality
   neon-branch.yml      — [1c] Neon branch lifecycle: create on PR open, delete on PR close
   neon-cleanup.yml     — [1c] Nightly: delete orphaned Neon preview branches
 dependabot.yml         — [1a] Automated dependency update PRs
```

`terraform.yml` is removed — infrastructure changes flow through Platform MCP, not CI/CD.

#### Vercel Deployment Strategy

Vercel builds artifacts from git pushes via its native GitHub integration. Auto-production deploy is **disabled**. The platform manages which deployment serves which environment through DNS pointer management and Vercel's promotion API.

For the environment chain (dev → qa → stg → prd), promotion is explicit via Platform MCP `environment_promote`. The platform:
1. Validates gate requirements (CI pass, quality suite, stakeholder approval)
2. Moves the DNS pointer (e.g., `qa.teachings.yogananda.tech`) to the deployment URL
3. Runs health verification against the new URL
4. Records the promotion with full audit trail

#### Neon Branch-per-PR

Preview deployments use Neon's branching for database isolation:

| Branch Type | Lifecycle | TTL | Cleanup |
|-------------|-----------|-----|---------|
| **Production** (`main`) | Permanent | — | — |
| **Preview** (per PR) | Created on PR open | 7 days after last commit | GitHub Action on PR close + nightly cleanup script |
| **CI test** (per run) | Created at test start | Deleted at test end | GitHub Action post-step |

TTL enforcement: a GitHub Action runs on PR close (`types: [closed]`) to delete the associated Neon branch via Neon API. A nightly cleanup script (`/scripts/neon-branch-cleanup.sh`) catches orphans.

#### Cost Alerting

AWS Budget alarm at 80% and 100% of monthly target ($100 for Arcs 1–3). Created by `bootstrap.sh`. Neon and Vercel cost alerts are configured manually in their dashboards.

### Environment Configuration

The portal has three distinct configuration layers — application environment variables, named constants, and developer tooling — each with a clear owner and location.

#### 1. Application Environment Variables (`.env.example`)

Values that vary per environment or contain secrets. The `.env.example` file is the local development reference. In deployed environments, the platform distributes secrets from AWS Secrets Manager (ADR-125) to Vercel environment variables via the Vercel API.

**Tag legend:** `[platform]` = set by Platform MCP in deployed environments (fill manually for local dev). `[secrets-manager]` = stored in AWS Secrets Manager; platform distributes to Vercel; fill manually in `.env.local` for local dev. `[static]` = fixed value, same across all environments.

**Secrets management architecture (ADR-125).** Two tiers:

| Tier | What | Where | Changes via |
|------|------|-------|-------------|
| **Config** (non-secrets) | Named constants, per-environment config, `NEXT_PUBLIC_*` build-time vars | `/lib/config.ts` + Vercel env vars | Code PR or Platform MCP |
| **Secrets** (all credentials) | API keys, tokens, connection strings | AWS Secrets Manager → Platform MCP → Vercel env vars | Secrets Manager update (+ platform redistribution) |

Secrets Manager path convention: `/portal/{environment}/{service}/{key-name}` (e.g., `/portal/production/voyage/api-key`).

**Credential distribution pattern.** The platform reads secret values from Secrets Manager and sets them as Vercel environment variables via API. Result: a single `project_bootstrap` or `environment_promote` distributes secrets to Vercel — the human never manually copies secrets between platforms. For local development, `.env.local` provides the same values directly. The `/lib/config.ts` facade checks environment variables first, so local dev works without Secrets Manager access.

**AWS authentication by context (ADR-126):**

| Context | Auth mechanism | Credentials |
|---|---|---|
| **Vercel functions → Bedrock + Secrets Manager** | Vercel OIDC federation (`portal-vercel-runtime` role) | `AWS_ROLE_ARN` env var (not a secret) — no stored keys |
| **Lambda → Bedrock/S3** | IAM execution role (attached at provisioning) | No env vars needed — role is automatic |
| **GitHub Actions → AWS** | GitHub OIDC federation (`portal-ci` role) | `AWS_ROLE_ARN` secret, no stored keys |
| **Local dev → Bedrock** | AWS credential chain fallback | `AWS_PROFILE=srf-dev` or `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` in `.env.local` |

**Zero long-lived AWS credentials.** Vercel OIDC (ADR-126) authenticates Vercel functions to AWS via short-lived OIDC tokens. Combined with GitHub Actions OIDC, no long-lived AWS credentials exist in any environment.

**Environment-scoped security.** The Vercel OIDC `sub` claim includes the deployment environment. Separate IAM roles per environment scope Secrets Manager access: production deployments can only read `/portal/production/*` secrets.

**`ANTHROPIC_API_KEY` is removed from `.env.example`.** The application code uses `@anthropic-ai/bedrock-sdk` for all Claude calls, routing through Bedrock in every environment including local dev.

**What is NOT in `.env.example`:**
- Model IDs, chunk sizes, search parameters → `/lib/config.ts` (see below)
- CI-only secrets (NEON_API_KEY, AWS_ROLE_ARN) → GitHub Secrets only
- Claude Code developer tooling → developer shell profile (see below)

#### 2. Named Constants (`/lib/config.ts` — ADR-123)

Tunable parameters that are not secrets and do not vary between environments. These are the "magic numbers" that ADR-123 requires as named constants. They change via code PRs, not env var updates.

```typescript
// /lib/config.ts — Named constants per ADR-123
// These are tunable defaults, not architectural commitments.
// Change via PR with evidence. Annotate: date, old → new, reason.

// ── AI Model Selection (ADR-014) ───────────────────────────────
export const BEDROCK_REGION = 'us-west-2';

// Real-time models (search pipeline — latency-sensitive)
export const CLAUDE_MODEL_CLASSIFY = 'anthropic.claude-3-5-haiku-20241022-v1:0';
export const CLAUDE_MODEL_EXPAND   = 'anthropic.claude-3-5-haiku-20241022-v1:0';
export const CLAUDE_MODEL_RANK     = 'anthropic.claude-3-5-haiku-20241022-v1:0';

// Batch models (offline — quality-sensitive)
export const CLAUDE_MODEL_BATCH    = 'anthropic.claude-opus-4-6-v1';

// ── Embedding (ADR-118) ────────────────────────────────────────
export const EMBEDDING_MODEL      = 'voyage-3-large';
export const EMBEDDING_DIMENSIONS = 1024;
export const EMBEDDING_INPUT_TYPE_QUERY    = 'query';
export const EMBEDDING_INPUT_TYPE_DOCUMENT = 'document';

// ── Chunking (ADR-048) ────────────────────────────────────────
export const CHUNK_SIZE_TOKENS    = 1000;
export const CHUNK_OVERLAP_TOKENS = 200;

// ── Search (ADR-044, ADR-119) ──────────────────────────────────
export const RRF_K = 60;
export const SEARCH_RESULTS_DEFAULT = 10;
export const SEARCH_RESULTS_MAX     = 50;
export const SEARCH_DEBOUNCE_MS     = 300;

// ── Rate Limiting (ADR-023) ────────────────────────────────────
export const RATE_LIMIT_SEARCH_RPM = 30;
export const RATE_LIMIT_API_RPM    = 60;

// ── Database Connection Resilience ────────────────────────────
export const DB_RETRY_COUNT          = 5;
export const DB_RETRY_FACTOR         = 2;
export const DB_RETRY_MIN_TIMEOUT_MS = 1000;

// ── Cache TTLs ─────────────────────────────────────────────────
export const CACHE_TTL_SEARCH_SECONDS     = 300;
export const CACHE_TTL_SUGGESTIONS_SECONDS = 3600;
```

Model IDs are parameters, not secrets — they don't need env var indirection. When a model is upgraded, the change is a code PR: visible, reviewable, and auditable.

#### 3. CI-Only Secrets (GitHub Secrets)

Never in `.env.local` or `.env.example`. Used only by GitHub Actions.

| Secret | Used by | Purpose |
|---|---|---|
| `AWS_ROLE_ARN` | GitHub Actions OIDC | Assume IAM role for AWS operations |
| `NEON_API_KEY` | Branch cleanup script | Neon branch management |

#### 4. Developer Tooling (Claude Code + MCP)

The AI developer (Claude Code) needs its own configuration, separate from the application. These are set in the developer's shell profile or session, not in `.env.example`.

```bash
# Claude Code — route through AWS Bedrock (same account as app)
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-west-2
export AWS_PROFILE=srf-dev           # or AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY

# MCP servers (configured in .claude/settings.json, not env vars)
# Neon MCP: uses NEON_API_KEY from env or settings
# Sentry MCP: uses SENTRY_AUTH_TOKEN from env or settings
```

### Local Development Environment

Developers run the app locally without the platform. The development environment uses a Neon dev branch (not local PostgreSQL) to ensure extension parity (pgvector, pg_search, pg_trgm, unaccent, pg_stat_statements).

**Bootstrap sequence:**

1. Clone repo, `pnpm install`
2. Copy `.env.example` → `.env.local`, fill in values (see § Environment Variables above)
3. `pnpm db:migrate` — applies dbmate migrations to the Neon dev branch
4. `pnpm dev` — starts Next.js dev server at `localhost:3000`

**Neon dev branch workflow:**

- The `dev` branch exists on the Neon project (created during project setup)
- Developers connect to the dev branch via `NEON_DATABASE_URL` in `.env.local`
- Each developer may create personal branches from `dev` for isolated work
- CI creates ephemeral branches per PR (see § Neon Branch-per-PR above)
- When working on migrations, run `pnpm db:migrate` against the dev branch

**Contentful local access:**

- Contentful Delivery API (read-only) is accessed via `CONTENTFUL_ACCESS_TOKEN` + `CONTENTFUL_SPACE_ID` in `.env.local`
- For ingestion development, the `CONTENTFUL_MANAGEMENT_TOKEN` is needed

**Offline/degraded mode:**

- If Neon is unreachable, `pnpm dev` still starts — page rendering works, but search and reader API calls fail with clear error messages
- If Contentful is unreachable, the book reader shows a fallback message; search continues to work
- Claude API unavailability (Bedrock) degrades search to pure hybrid results

The platform manages deployed environments only. Local development uses direct Neon connection strings and local config files.

**Operational surface companion:** DES-060 specifies the operational *surface* built on top of this infrastructure foundation — health endpoint, SLI/SLO framework, and design-artifact traceability. Operational dashboarding is provided by the platform MCP server. DES-039 is the infrastructure; DES-060 is the visibility layer. See PRO-035, PRO-036, PRO-037, PRO-039.

---

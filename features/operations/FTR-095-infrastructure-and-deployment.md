---
ftr: 95
title: Infrastructure and Deployment
summary: "Bootstrap script, deployment ceremony, and infrastructure-as-code for AWS and Vercel resources"
state: implemented
domain: operations
governed-by: [PRI-10, PRI-12]
depends-on: [FTR-106, FTR-108, FTR-110]
---

# FTR-095: Infrastructure and Deployment

## Rationale

All infrastructure is managed as code. Vendor resources are managed by the yogananda-platform MCP server (FTR-106); one-time AWS security setup uses `bootstrap.sh`. This separation keeps the teachings app as a deployable application while the platform manages its infrastructure lifecycle.

The three-layer model (bootstrap, platform, application) ensures each concern has exactly one owner: security primitives are scripted and idempotent, vendor resources are declaratively managed, and application code owns only its own schema and configuration.

## Specification

### Bootstrap: One-Time Security Setup

`scripts/bootstrap.sh` creates AWS security infrastructure that exists once and rarely changes: IAM roles, OIDC federation, KMS keys, Secrets Manager paths, S3 buckets, and DynamoDB tables. The script is idempotent.

| Step | What It Creates | Manual? |
|------|----------------|---------|
| 1 | S3 bucket (`srf-portal-terraform-state`) — versioned, AES-256, public access blocked | No |
| 2 | DynamoDB table (`srf-portal-terraform-locks`) — `LockID` partition key, on-demand | No |
| 3 | OIDC provider + IAM role (`portal-ci`) from `terraform/bootstrap/trust-policy.json` | No |
| 4 | Neon org API key — console-only, paste when prompted | Yes |
| 5 | Sentry auth token — console-only, paste when prompted | Yes |
| 6 | GitHub secrets in batch via `gh` CLI | No |

**Prerequisites:** AWS CLI configured, `gh` CLI authenticated, Neon and Sentry accounts exist. See `docs/guides/getting-started.md`.

**IAM policy documents** in `terraform/bootstrap/`: `trust-policy.json`, `ci-policy.json`, `vercel-trust-policy.json`, `vercel-runtime-policy.json`. These are reference documents for `bootstrap.sh`, not active Terraform configuration.

### Three-Layer Infrastructure Model

| Layer | Tool | Scope | Frequency |
|-------|------|-------|-----------|
| One-time security | `bootstrap.sh` | IAM, OIDC, KMS, Secrets Manager, S3, DynamoDB | Once at project creation |
| Vendor resources | Platform MCP | Vercel, Neon, Route 53, Contentful, Sentry | On onboarding; drift checks as needed |
| Operational lifecycle | Platform MCP | Environments, deployments, promotions, health | Every deployment cycle |

The declarative spec lives in `config/projects/teachings.json` in the platform repo. Key platform MCP tools: `project_bootstrap`, `project_audit`, `environment_create`, `environment_promote`, `environment_destroy`, `deploy_status`.

### Deployment Model

Vercel builds immutable deployment URLs from git pushes. Auto-production deploy is disabled.

**Promotion chain:** dev (automatic, tracks main) → qa (requires CI pass) → stg (requires quality suite) → prd (requires stakeholder approval + deployment ceremony). Promotion is DNS pointer swap via Platform MCP `environment_promote` (< 5 seconds). Rollback: promote the previous deployment.

### Two-Layer Neon Management

| Layer | Tool | Scope |
|-------|------|-------|
| Infrastructure + Operations | Platform MCP + Neon MCP | Project, branches, environment isolation, snapshots, schema diffs, connection strings |
| Data | SQL via `@neondatabase/serverless` + dbmate | Schema migrations, content, queries, extensions |

**Neon MCP as development tool.** Claude uses `@neondatabase/mcp-server-neon` for interactive operations: `run_sql`, `prepare_database_migration`, `complete_database_migration`, `compare_database_schema`, `create_branch`, `get_connection_string`, `describe_branch`.

**API key scoping (FTR-094):** All contexts (Platform MCP, CI, Claude Code) use project-scoped API keys for least privilege.

### Responsibility Boundaries

| Platform MCP | Operations (Neon MCP/CLI) | Application Code |
|-------------|--------------------------|-----------------|
| Vendor resource creation | Ephemeral branches (CI, PR, migration test) | Database schema + extensions (dbmate) |
| Persistent branches, DNS records | Snapshots, schema diffs | Lambda handlers, CI workflows |
| Deployment tracking, promotion, gates | Connection strings, Time Travel | Application routing, error tracking config |

### CI/CD Pipeline (GitHub Actions)

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
 2. Neon snapshot (if /migrations/ changed)
 3. dbmate migrate
 4. Platform auto-tracks main → dev environment
```

**Workflow files:** `ci.yml` (app CI), `neon-branch.yml` (branch lifecycle per PR), `neon-cleanup.yml` (nightly orphan cleanup), `dependabot.yml` (dependency updates).

**Neon branch-per-PR:** Preview branches created on PR open (7-day TTL), deleted on PR close. CI test branches are ephemeral per run. Nightly cleanup catches orphans.

**Cost alerting:** AWS Budget alarm at 80%/100% of monthly target ($100). Neon and Vercel alerts in their dashboards.

### Environment Configuration

Four configuration layers, each with a single owner:

**1. Application env vars (`.env.example`)** — values that vary per environment or contain secrets. In deployed environments, Platform MCP distributes secrets from AWS Secrets Manager (FTR-112) to Vercel. Path convention: `/portal/{environment}/{service}/{key-name}`.

**2. Named constants (`/lib/config.ts`, FTR-012)** — tunable parameters that are not secrets and do not vary between environments: model IDs, chunk sizes, search parameters, rate limits, cache TTLs. Change via code PR.

**3. CI-only secrets (GitHub Secrets)** — `AWS_ROLE_ARN` (OIDC role assumption), `NEON_API_KEY` (branch management). Never in `.env.local`.

**4. Developer tooling** — Claude Code configuration (`CLAUDE_CODE_USE_BEDROCK`, `AWS_REGION`, `AWS_PROFILE`) in the developer's shell profile. MCP servers in `.claude/settings.json`.

### AWS Authentication (FTR-113)

Zero long-lived AWS credentials. All contexts use OIDC or IAM role assumption:

| Context | Auth Mechanism |
|---------|---------------|
| Vercel functions → Bedrock/Secrets Manager | Vercel OIDC (`portal-vercel-runtime` role) |
| Lambda → Bedrock/S3 | IAM execution role |
| GitHub Actions → AWS | GitHub OIDC (`portal-ci` role) |
| Local dev → Bedrock | AWS credential chain (`AWS_PROFILE=srf-dev`) |

Environment-scoped security: the Vercel OIDC `sub` claim includes the deployment environment, so production can only read `/portal/production/*` secrets.

### Local Development

Developers run locally without the platform, connecting to a Neon dev branch for extension parity (pgvector, pg_search, pg_trgm, unaccent, pg_stat_statements).

1. Clone repo, `pnpm install`
2. Copy `.env.example` → `.env.local`, fill values
3. `pnpm db:migrate` — applies migrations to Neon dev branch
4. `pnpm dev` — starts Next.js at `localhost:3000`

**Degraded mode:** If Neon is unreachable, pages render but search/reader APIs fail gracefully. If Contentful is unreachable, reader shows fallback; search works. If Bedrock is unreachable, search degrades to pure hybrid results.

### Companion Features

FTR-096 specifies the operational visibility layer (health endpoint, SLI/SLO framework) built on this infrastructure. FTR-112 governs secrets management. FTR-113 governs OIDC authentication.

## Notes

**History:** Originally specified Terraform for all infrastructure management. Revised 2026-03 when the yogananda-platform MCP server (FTR-106) absorbed vendor resource management, eliminating the Terraform CI pipeline. The three-layer Neon model was simplified to two layers for the same reason. `bootstrap.sh` retained for one-time AWS security setup that predates the platform.

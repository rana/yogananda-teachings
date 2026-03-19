---
ftr: 110
title: Multi-Environment Infrastructure Design
summary: "Branch-based environment separation: Neon branches, Vercel previews, Contentful environments, Sentry tags"
state: implemented
domain: foundation
governed-by: [PRI-10, PRI-12]
depends-on: [FTR-106]
---

# FTR-110: Multi-Environment Infrastructure Design

## Rationale

### Context

The portal will operate across multiple environments (dev, staging, production) as it moves toward production readiness. SRF uses AWS as their cloud provider and Platform MCP for infrastructure management. The architecture team has autonomous design authority for infrastructure decisions. Key constraint: the portal is a free, public, no-auth teaching portal — environment isolation requirements differ from SRF's member-facing or e-commerce systems that handle PII and payments.

### Decision

**Branch = environment.** Each service uses its native branching/environment primitive — one project per service, branches for separation. Environments are created and destroyed with a single script. Milestones 1a–3d use `dev` only; multi-environment promotion activates at Milestone 4a+.

### Core Principle: One Project, Branch-Based Separation

| Service | One Instance | Environment Primitive | How Separation Works |
|---------|-------------|----------------------|---------------------|
| **Neon** | One project | Branches | `main` (prod), `staging`, `dev` — instant copy-on-write. Platform MCP declares persistent branches; operations layer manages ephemeral. |
| **Vercel** | One project | Branch deployments | Production from `main`, preview from branches. Vercel-native, zero config. |
| **Sentry** | One project | `environment` tag | Single DSN, events tagged `production`/`staging`/`development`. Standard Sentry pattern. |
| **Contentful** | One space | Environments feature | `master` (prod), `staging`, `dev` aliases. Content model changes promoted via migration CLI. |
| **S3 (legacy state)** | One bucket | Path-based | `env:/dev/terraform.tfstate`, `env:/staging/...`, `env:/prod/...` — legacy from initial Terraform setup; retained for state history. |
| **DynamoDB (locks)** | One table | Shared | Lock key includes workspace path. No duplication. |
| **Voyage AI** | One API key | N/A | Stateless embedding service. No environment separation needed. |

**Why single-project over multi-project:** Neon branching is instant and zero-cost — creating a separate project per environment is overhead without benefit. Vercel's branch deployment model already maps Git branches to environments. Sentry's environment tagging is the documented best practice. This approach makes environments disposable — create in minutes, destroy in seconds.

### AWS Account Strategy

Single AWS account with IAM role boundaries through Milestone 3d. If SRF governance requires separate accounts for production (a stakeholder decision, not a technical one), the platform config model supports multi-account without rearchitecture — add an OIDC role per account and a provider alias per environment.

```
AWS Account: srf-teachings (dedicated account within SRF AWS Organization)
├── IAM OIDC Provider: token.actions.githubusercontent.com — GitHub Actions federation
├── IAM OIDC Provider: oidc.vercel.com/{TEAM_SLUG}       — Vercel runtime federation (FTR-113)
├── IAM Role: portal-ci              — OIDC federation for GitHub Actions
├── IAM Role: portal-ci-staging      — (Milestone 4a+) tighter permissions
├── IAM Role: portal-ci-prod         — (Milestone 4a+) production-only permissions
├── IAM Role: portal-vercel-runtime  — Vercel OIDC → Bedrock + Secrets Manager (FTR-113)
├── KMS Key: portal-secrets          — Encrypts all Secrets Manager entries (FTR-112)
├── Secrets Manager: /portal/{env}/* — All application secrets (FTR-112)
├── S3: srf-portal-terraform-state   — Legacy Terraform state (retained for history)
├── S3: srf-portal-assets-{env}      — Per-environment asset buckets
├── Lambda: {env}-*                  — Per-environment functions (Milestone 2a+)
└── DynamoDB: srf-portal-terraform-locks — Legacy state locking (retained)
```

Platform MCP + environment configuration parameterize resource names, compute sizes, and permissions per environment. Environment-specific IAM roles provide blast-radius containment within a single account.

### Bootstrap Automation

The human should never visit five consoles and copy-paste credentials. A bootstrap script automates everything the AWS CLI, Neon CLI, Vercel CLI, and GitHub CLI can handle — prompting the human only for the two credentials that require manual console creation.

**Script interface:**

```bash
# One-time infrastructure bootstrap (~5 minutes)
./scripts/bootstrap.sh

# Create a new environment (Milestone 4a+, ~2 minutes)
./scripts/create-env.sh staging

# Destroy an environment (Milestone 4a+, ~1 minute)
./scripts/destroy-env.sh staging
```

**`bootstrap.sh` flow:**

1. AWS CLI: Create S3 bucket, enable versioning + encryption + public access block
2. AWS CLI: Create DynamoDB table (`srf-portal-terraform-locks`, `LockID` partition key, on-demand)
3. AWS CLI: Create OIDC provider + IAM role from `terraform/bootstrap/trust-policy.json`
4. **Prompt:** Neon org API key (console-only — paste when prompted)
5. **Prompt:** Sentry auth token (console-only — paste when prompted)
6. Vercel CLI: Link project, get token
7. GitHub CLI: `gh secret set` for all 6 secrets in batch

The script is idempotent — safe to re-run. Each step checks for existing resources before creating.

**`create-env.sh {env}` flow (Milestone 4a+):**

1. Platform MCP provisions environment resources (Neon branch, S3 buckets, Lambda functions)
2. `neonctl branches create --name {env} --parent main`
3. `gh api` — configure GitHub Environment with protection rules

**`destroy-env.sh {env}` flow:**

1. Platform MCP deprovisions environment resources
2. `neonctl branches delete {env}`
3. `gh api` — remove GitHub Environment

### CI/CD Promotion Pipeline

```
PR → dev (auto) → staging (manual gate) → prod (manual gate)
```

- **CI-agnostic scripts.** All deployment logic lives in `/scripts/` (FTR-108). GitHub Actions calls these scripts; any future CI system calls the same scripts.
- **Manual production gate.** Production deployments always require manual approval. No automatic promotion from staging to production.
- **GitHub Environments.** Each environment is a GitHub Environment with its own URL and protection rules, enabling deployment tracking and required reviewers.
- **Promotion = merge.** Staging → production is a Git merge to `main`. Neon branch promotes. Vercel rebuilds. Platform promotes with `environment_promote`.

### Rationale

- **Branch = environment.** Neon invented branching for this use case. Vercel's model maps Git branches to deployments natively. Using these primitives — instead of creating separate projects per environment — reduces bootstrap overhead from "visit 5 dashboards, create 15 resources" to "run one script, paste two keys."
- **Proportionate isolation.** This portal has no PII, no authentication (until Milestone 7a+ "if ever"), no financial data. IAM role boundaries within a single AWS account provide sufficient isolation. If SRF governance requires account-level isolation for production, the architecture supports it via workspace-scoped provider aliases — a configuration change, not a rearchitecture.
- **Disposable environments.** `create-env.sh staging` takes ~2 minutes. `destroy-env.sh staging` takes ~1 minute. Environments are cheap to create and free to destroy. This enables experimentation without overhead.
- **CI portability.** Because deployment scripts are CI-agnostic (FTR-108), any future SCM migration is a configuration change, not a re-architecture.

### Consequences

- Platform configurations parameterized by environment from Milestone 1a
- Single AWS account with IAM role boundaries (escalate to multi-account only if SRF governance requires it)
- One Neon project with branch-based environment separation (FTR-094)
- One Vercel project with branch deployments
- One Sentry project with environment tagging
- One Contentful space with environment aliases
- `scripts/bootstrap.sh` created in Deliverable M1a-1 — automates all CLI-scriptable setup
- `scripts/create-env.sh` and `scripts/destroy-env.sh` created in Milestone 4a when multi-environment activates
- `terraform/bootstrap/trust-policy.json` checked into repo — the one artifact the bootstrap script needs
- GitHub Environments configured per environment (dev, staging, prod) with protection rules
- Neon branching strategy documented in FTR-095 § Infrastructure Bootstrap

**Operational surface extension:** FTR-096 specifies health endpoints, SLI/SLO targets, and design-artifact traceability. Operational dashboarding moved to the platform MCP server — the teachings app exposes data via `/api/v1/health`, the platform provides the operational surface. See FTR-096, FTR-096.

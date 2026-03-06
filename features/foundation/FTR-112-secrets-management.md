# FTR-112: Secrets Management Strategy — Two-Tier Model with AWS Secrets Manager

**State:** Approved
**Domain:** foundation
**Arc:** 1+
**Governed by:** PRI-10, PRI-12

## Rationale

### Context

The portal manages ~12 secrets across multiple services (Neon, Voyage, Contentful, Sentry, AWS Bedrock). A secrets management strategy must address:

1. **Audit trail.** Who accessed what secret, when? CloudTrail provides this for AWS-managed secrets. Platform-native stores (GitHub Secrets, Vercel env vars) do not.
2. **Single source of truth.** Each secret should live in exactly one place, distributed to consumers by Platform MCP — not duplicated across platforms.
3. **Rotation without redeployment.** Secrets Manager supports runtime reads with caching — rotation takes effect on the next cache refresh without redeployment. Vercel env vars require a redeployment.
4. **SRF organizational alignment.** SRF's established technology stack (Tech Stack Brief § 7) designates AWS Secrets Manager for sensitive credentials and SSM Parameter Store for non-sensitive config.
5. **10-year design horizon (FTR-004).** The credential count will grow as arcs add services (Cohere, YouTube, SendGrid, New Relic, Amplitude, Auth0). A centralized foundation now avoids retrofitting later.

### Decision

Adopt a **two-tier configuration model** with AWS Secrets Manager as the single source of truth for all application secrets.

#### Tier 1 — Code + Vercel Environment Variables (non-secrets)

Values that are not sensitive. Two sub-categories:

| Sub-tier | Where | Changes via | Examples |
|----------|-------|-------------|----------|
| Named constants | `/lib/config.ts` (FTR-012) | Code PR | Model IDs, chunk sizes, rate limits, cache TTLs |
| Per-environment config | Vercel env vars (set by Platform MCP) | Platform MCP or Vercel dashboard | `AWS_REGION`, `NEON_PROJECT_ID`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_*` build-time vars |

**`NEXT_PUBLIC_*` carve-out:** Variables prefixed `NEXT_PUBLIC_` are injected at build time by the Next.js build runtime. They cannot be sourced from Secrets Manager at runtime — this is a hard Vercel/Next.js constraint, not a design choice. Documented as intentional divergence from the SRF standard, which was written for Lambda (runtime-only).

#### Tier 2 — AWS Secrets Manager (all secrets)

Every credential, API key, token, and connection string lives in Secrets Manager. One secret per logical credential, organized by path convention:

```
/portal/{environment}/{service}/{key-name}
```

Examples:
- `/portal/production/neon/database-url`
- `/portal/production/voyage/api-key`
- `/portal/production/contentful/access-token`
- `/portal/production/sentry/auth-token`

**Access patterns:**

| Context | How secrets are accessed | Auth mechanism |
|---------|------------------------|----------------|
| **Vercel functions (runtime)** | `@aws-sdk/client-secrets-manager` via `/lib/config.ts` facade, cached with 5-minute TTL | Vercel OIDC role (FTR-113) |
| **Lambda functions** | IAM execution role → `GetSecretValue` | IAM role (automatic) |
| **GitHub Actions / Platform MCP** | `aws secretsmanager get-secret-value` via OIDC role, or Platform MCP reads secrets | GitHub OIDC (FTR-106) |
| **Local development** | `.env.local` (fallback — facade checks env vars before Secrets Manager) | AWS profile `srf-dev` |

**The `/lib/config.ts` facade.** Call sites import config from `/lib/config.ts` and never know whether a value came from `process.env`, Secrets Manager, or a hardcoded constant. The facade's resolution order:

1. Environment variable (if set) — enables `.env.local` override for local dev
2. Secrets Manager (if running in AWS-accessible environment) — cached with TTL
3. Default value (for non-required config) or throw (for required secrets)

This makes migrating a value between tiers invisible to all consumers. Adding SSM Parameter Store as a third tier in the future requires only facade changes — zero call-site modifications.

#### SSM Parameter Store — Deferred, Not Rejected

The SRF Tech Stack Brief designates SSM Parameter Store for non-sensitive runtime config. The portal defers SSM adoption because:

- The portal has ~8 non-sensitive config values, all well-served by `/lib/config.ts` + Vercel env vars
- SSM's primary value is for large Lambda fleets with hundreds of config values requiring runtime mutation without redeployment
- The `/lib/config.ts` facade preserves the option to add SSM with zero application code changes when a concrete need arises (feature flags, runtime log-level switching, etc.)

This is an intentional, documented divergence from the SRF standard — not an oversight. The critical SRF alignment point (Secrets Manager for sensitive credentials) is fully honored.

#### AWS Account Model

The portal operates in a **dedicated AWS account within SRF's AWS Organization**. This provides:

- Full blast-radius isolation from other SRF services
- Organizational billing consolidation
- Service Control Policies (SCPs) from the org for guardrails
- Independent IAM policies and OIDC trust relationships
- No credential sharing or cross-account access needed for portal operations

#### Platform MCP Integration

Platform MCP manages secret *resources* (names, policies, KMS encryption, rotation configuration) but not secret *values*:

- Secret resources created with path convention `/portal/{environment}/{service}/{key-name}`
- KMS customer-managed key encrypts all entries
- Secret VALUES populated manually or via bootstrap script — never in configuration files

Platform MCP reads secrets from Secrets Manager and distributes them to Vercel as environment variables:

- Reads secret values via `aws secretsmanager get-secret-value`
- Sets Vercel project environment variables via Vercel API
- Single source of truth, platform-distributed

This means Vercel env vars are *derived from* Secrets Manager via Platform MCP, not independently managed. Single source of truth, platform-distributed.

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **AWS Secrets Manager (chosen)** | SRF standard; CloudTrail audit; rotation automation; single source of truth; Lambda-native | ~$5/month (12 secrets × $0.40); SDK call on cold start (mitigated by caching) |
| **GitHub Secrets + Vercel env vars only** | Zero additional cost; simpler setup; native to each platform | No audit trail; manual multi-platform rotation; credential duplication; no rotation-without-redeployment; SRF non-conformant |
| **HashiCorp Vault** | Most powerful; multi-cloud; dynamic secrets | Operational overhead (self-hosted or Cloud); not in SRF stack; overkill for portal scale |
| **SSM Parameter Store (SecureString)** | Free; AWS-native | No built-in rotation; limited audit granularity; SRF standard reserves it for non-sensitive config |

### Consequences

- All `[secret]`-tagged env vars in `.env.example` have a corresponding Secrets Manager resource managed by Platform MCP
- FTR-095 § Environment Configuration updated with secrets management architecture and `/lib/config.ts` facade specification
- `docs/guides/bootstrap-credentials.md` updated: secrets created in Secrets Manager during bootstrap, distributed to Vercel by Platform MCP
- `.env.example` uses `[secrets-manager]` tag: Secrets Manager in deployed environments; env var in `.env.local` for local dev
- Rotation is single-point: update Secrets Manager, run platform redistribution, done. No multi-platform coordination.
- CloudTrail logs all `GetSecretValue` calls — audit trail for secret access from Milestone 1c
- KMS customer-managed key encrypts all portal secrets (cost: ~$1/month per key)
- **Extends:** FTR-106 (Platform MCP), FTR-110 (environment lifecycle), FTR-094 (Neon keys)
- **Enables:** FTR-113 (Vercel OIDC — secrets accessed via role, not stored keys)

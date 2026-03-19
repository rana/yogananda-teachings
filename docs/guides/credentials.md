# Bootstrap Credentials Checklist

One-time credential provisioning required before the first deployment. The human principal creates these accounts and tokens — they cannot be automated. See FTR-106 (revised) for infrastructure architecture, FTR-112 for secrets management strategy, FTR-113 for Vercel OIDC federation, and FTR-095 for deployment spec.

## STG-001 (infrastructure bootstrap)

| Credential | Where to create | What it enables | Store as |
|---|---|---|---|
| **S3 bucket** | `bootstrap.sh` creates (`srf-portal-terraform-state`, versioning + AES-256 encryption) | Backup and state storage | Created automatically |
| **DynamoDB table** | `bootstrap.sh` creates (`srf-portal-terraform-locks`, partition key `LockID` String, on-demand) | Legacy state locking (retained from initial setup) | Created automatically |
| **AWS Account** (region: `us-west-2`) | aws.amazon.com | S3 backups, Lambda, Bedrock, EventBridge, Secrets Manager, KMS | — |
| **AWS IAM OIDC Identity Provider (GitHub)** | `bootstrap.sh` creates via AWS CLI | GitHub Actions → AWS auth (no stored keys) | — |
| **AWS IAM OIDC Identity Provider (Vercel)** | `bootstrap.sh` creates via AWS CLI | Vercel functions → Bedrock + Secrets Manager (FTR-113, no stored keys) | — |
| **AWS IAM Role (portal-ci)** | `bootstrap.sh` creates via AWS CLI | Scoped CI permissions (S3, Lambda, Secrets Manager) | ARN → GitHub secret `AWS_ROLE_ARN` |
| **AWS IAM Role (portal-vercel-runtime)** | `bootstrap.sh` creates via AWS CLI | Vercel OIDC → Bedrock inference + Secrets Manager reads | ARN → Vercel env var `AWS_ROLE_ARN` (set by Platform MCP) |
| **AWS KMS key (portal-secrets)** | `bootstrap.sh` creates via AWS CLI | Encrypts all Secrets Manager entries | Managed by bootstrap |
| **AWS Secrets Manager entries** | `bootstrap.sh` creates (empty), populated during bootstrap | Centralized secret store (FTR-112) | Secret values populated via `bootstrap.sh` or manually |
| **Neon API key** | console.neon.tech → API Keys | Platform MCP + Neon MCP operations | AWS Secrets Manager `/portal/production/neon/org-api-key` + GitHub secret `NEON_API_KEY` |
| **Vercel API token** | vercel.com → Settings → Tokens | Platform MCP Vercel operations | GitHub secret `VERCEL_TOKEN` |
| **Vercel Org/Team ID** | vercel.com → Settings → General | Platform MCP scoping | GitHub secret `VERCEL_ORG_ID` |
| **Sentry auth token** | sentry.io → Settings → Auth Tokens | Platform MCP Sentry operations | AWS Secrets Manager `/portal/production/sentry/auth-token` + GitHub secret `SENTRY_AUTH_TOKEN` |
| **Sentry org slug** | sentry.io → Settings → General | Platform MCP scoping | GitHub secret `SENTRY_ORG` |
| **Neon spend alert** | console.neon.tech → Billing → Alerts | Cost protection ($50/mo threshold) | Dashboard setting (manual) |
| **Vercel spend alert** | vercel.com → Settings → Billing → Spend Management | Cost protection ($50/mo threshold) | Dashboard setting (manual) |

## STG-001 (content + embeddings)

| Credential | Where to create | What it enables | Store as |
|---|---|---|---|
| **Voyage AI API key** | dash.voyageai.com → API Keys | Embedding generation (FTR-024) | AWS Secrets Manager `/portal/production/voyage/api-key` → Platform MCP distributes to Vercel |
| **Contentful Management Token** | app.contentful.com → Settings → API Keys | Content ingestion pipeline | AWS Secrets Manager `/portal/production/contentful/management-token` |
| **Contentful Access Token** | app.contentful.com → Settings → API Keys | Delivery API (read-only) | AWS Secrets Manager `/portal/production/contentful/access-token` → Platform MCP distributes to Vercel |
| **Contentful Space ID** | app.contentful.com → Settings → General | API scoping | GitHub secret `CONTENTFUL_SPACE_ID` (non-secret config) |

## STG-003 (deploy + AI enrichment)

| Credential | Where to create | What it enables | Store as |
|---|---|---|---|
| **AWS Bedrock model access** | AWS Console → Bedrock → Model Access (`us-west-2`) | Claude Haiku inference | Enabled for the `portal-vercel-runtime` IAM role |

## STG-009 (observability + MCP)

| Credential | Where to create | What it enables | Store as |
|---|---|---|---|
| **New Relic User API key** | one.newrelic.com → API Keys → Create (User type) | MCP server: NRQL queries, alerts, APM, deployments | `.env.local` `NEW_RELIC_API_KEY` + VS Code MCP config |
| **New Relic Account ID** | one.newrelic.com → Account Settings | Scoping API queries (optional — can pass per query) | `.env.local` `NEW_RELIC_ACCOUNT_ID` |

## Later stages (not needed for STG-001–STG-003)

| Credential | When | Notes |
|---|---|---|
| YouTube API Key | STG-009+ (video integration) | Google Cloud Console → Secrets Manager |
| Amplitude API Key | STG-009 (analytics) | Amplitude dashboard (`NEXT_PUBLIC_*` — Vercel env var, not Secrets Manager) |
| SendGrid API Key | STG-020 (email) | SendGrid dashboard → Secrets Manager (FTR-154; see FTR-151 for SES alternative) |
| ~~Cloudflare API Token~~ | Removed from portal stack (FTR-118) | If SRF routes domain through Cloudflare, add at that point |
| Auth0 credentials | STG-023+ (if ever) | Auth0 dashboard → Secrets Manager. **Provisioned early:** tenant `yogananda-tech.us.auth0.com`, M2M app configured. See `.env.local` for client ID/secret. |

## Auth Mechanism Summary

**Zero long-lived AWS credentials.** The portal uses OIDC federation for all AWS access — no IAM user access keys exist anywhere.

| Context | Mechanism | Credential | Stored Where |
|---------|-----------|------------|-------------|
| GitHub Actions → AWS | GitHub OIDC federation (FTR-106) | Ephemeral STS tokens | No stored keys |
| Vercel functions → Bedrock + Secrets Manager | Vercel OIDC federation (FTR-113) | Ephemeral STS tokens | No stored keys |
| Lambda → AWS services | IAM execution role | Automatic role credentials | No stored keys |
| Claude Code → Neon | Project-scoped API key | `NEON_API_KEY` | `.env.local` |
| CI → Neon branches | Project-scoped API key | `NEON_PROJECT_API_KEY` | GitHub secret |
| Platform MCP → vendors | Org/account tokens | Various | Platform config + GitHub secrets |
| Local dev → AWS | AWS credential chain | Named profile or access keys | `~/.aws/credentials` or `.env.local` |

**Secrets Manager as single source of truth (FTR-112).** All application secrets live in AWS Secrets Manager under `/portal/{environment}/{service}/{key-name}`. Platform MCP reads from Secrets Manager and distributes to Vercel env vars. Local dev uses `.env.local` directly (the `/lib/config.ts` facade checks env vars first).

See FTR-095 § Environment Configuration for the complete `.env.example`, named constants, CI secrets table, and Claude Code developer tooling setup.

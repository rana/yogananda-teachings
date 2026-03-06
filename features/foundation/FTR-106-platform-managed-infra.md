# FTR-106: Platform-Managed Infrastructure

**State:** Approved
**Domain:** foundation
**Arc:** 1+
**Governed by:** PRI-10, PRI-12

## Rationale

### Context

The portal's infrastructure spans multiple vendors: AWS (S3, Lambda, Bedrock, Secrets Manager, IAM), Neon (PostgreSQL), Vercel (hosting), Contentful (CMS), Sentry (errors), and GitHub (SCM/CI). Traditional IaC approaches use Terraform or Pulumi to manage these declaratively. The question: does the AI-native development model (PRI-12) change the IaC approach?

### Decision

Adopt **Platform MCP as the primary infrastructure management interface**, with `teachings.json` as the declarative configuration manifest. `bootstrap.sh` handles one-time AWS security setup (IAM, OIDC, KMS) that requires imperative CLI commands.

### Architecture

```
teachings.json (declarative manifest)
    ↓
Platform MCP (reads manifest, manages resources)
    ↓
├── Neon: project, branches, compute, extensions
├── Vercel: project, domains, env vars, integrations
├── AWS: S3, Lambda, EventBridge, Secrets Manager resources
├── Contentful: space, environments, content types
├── Sentry: project, alert rules, release tracking
└── GitHub: repo settings, secrets, environments, branch protection
```

### Configuration Manifest (`teachings.json`)

The manifest is a JSON file in the repo root. It declares the desired state of all managed resources. Platform MCP reads this manifest and reconciles actual state with desired state.

Key sections:
- `project`: name, organization, environments
- `neon`: project settings, compute sizes, extensions, branch policies
- `vercel`: project settings, domains, framework config
- `aws`: S3 buckets, Lambda functions, EventBridge rules, Secrets Manager paths
- `contentful`: space config, content type schemas
- `sentry`: project config, alert rules

### `bootstrap.sh` — One-Time AWS Security

AWS IAM, OIDC providers, and KMS keys require imperative CLI commands that don't fit the declarative manifest model. `bootstrap.sh` handles these one-time operations:

1. Create S3 state bucket with versioning + encryption
2. Create DynamoDB lock table
3. Create OIDC providers (GitHub + Vercel)
4. Create IAM roles with trust policies
5. Create KMS customer-managed key for secrets encryption
6. Set GitHub Actions secrets

The script is idempotent — safe to re-run. Each step checks for existing resources.

### Rationale

- **AI-native operations (PRI-12).** Claude operates infrastructure through MCP — the same interface used for development. No context-switching between code editor and infrastructure tools.
- **Preserves IaC capabilities.** `teachings.json` is declarative (desired state), repeatable (same manifest → same infrastructure), auditable (Git history), and diffable (PR review shows infrastructure changes).
- **Single source of truth.** One manifest file describes the entire infrastructure. No scattered Terraform modules, no Pulumi programs, no CloudFormation stacks.
- **10-year horizon (FTR-004).** The manifest is a JSON file — the most durable configuration format. If Platform MCP is replaced, the manifest is human-readable and machine-parseable by any successor tool.

### GitHub Integration

- Repository settings, branch protection rules, and GitHub Environments managed via GitHub CLI (`gh`) calls from Platform MCP
- GitHub Actions secrets set during bootstrap and updated by Platform MCP when secrets rotate
- CI/CD workflows in `.github/workflows/` call CI-agnostic scripts (FTR-108)

### Consequences

- `teachings.json` in repo root — the single infrastructure manifest
- `scripts/bootstrap.sh` — one-time AWS security setup
- Platform MCP reconciles manifest against actual state
- No Terraform HCL files in active use (legacy state files retained for history)
- Infrastructure changes are PRs that modify `teachings.json` — reviewed like code
- **Extends FTR-004** (10-year horizon), **FTR-108** (CI-agnostic scripts)
- **Enables FTR-107** (Lambda managed by Platform MCP), **FTR-109** (S3 backup managed by Platform MCP), **FTR-112** (Secrets Manager managed by Platform MCP)

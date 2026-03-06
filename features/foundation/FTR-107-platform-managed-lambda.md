# FTR-107: Platform-Managed Lambda for Batch Compute

**State:** Approved
**Domain:** foundation
**Arc:** 1+
**Governed by:** PRI-10, PRI-12

## Rationale

### Context

The portal needs batch compute for operations that don't belong in the request/response cycle: database backups, content ingestion, chunk relation computation, daily email dispatch, social media image generation, and content pipeline orchestration. Options evaluated:

1. **Vercel Cron Jobs** — simple but limited (60s timeout on Hobby, 300s on Pro). Tied to Vercel platform.
2. **GitHub Actions scheduled workflows** — CI-native but SCM-dependent. If the portal migrates from GitHub, all scheduled jobs need rewriting.
3. **AWS Lambda + EventBridge** — durable infrastructure managed alongside other AWS services. SCM-agnostic.
4. **Serverless Framework v4** — deployment tool for Lambda. Adds licensing cost ($2/dev/month Pro) and a dependency.

### Decision

Use **AWS Lambda with EventBridge scheduling**, deployed and managed via **Platform MCP** (not Serverless Framework). Lambda handlers are thin wrappers around `/lib/services/` functions.

### Lambda Directory Structure

```
/lambda/
  /handlers/
    backup.ts          — pg_dump → S3 (Milestone 3a)
    ingest.ts          — Book ingestion pipeline (Milestone 3a)
    relations.ts       — Chunk relation computation (Milestone 3a)
    aggregate-themes.ts — Nightly search theme aggregation (Milestone 3d)
    send-email.ts      — Daily passage email dispatch (Milestone 5a)
    generate-social.ts — Quote image generation (Milestone 5a)
    webhook-contentful.ts — Contentful sync (Milestone 1c+)
    ingest-transcript.ts — YouTube transcript ingestion (Arc 6)
    compute-graph.ts   — Knowledge graph positions (Arc 6)
    process-image.ts   — Image tier generation (Arc 6)
    process-audio.ts   — Audio transcription (Arc 6)
  /layers/
    shared/            — Shared deps (Neon client, Claude SDK)

/terraform/modules/
  /lambda/
    main.tf            — Functions, layers, IAM roles, VPC config
    variables.tf
    outputs.tf
  /eventbridge/
    main.tf            — Scheduler rules, event patterns
    variables.tf
```

Each Lambda handler is a thin wrapper that imports from `/lib/services/` — the framework-agnostic service layer (FTR-015). The business logic is identical whether invoked by Lambda, CLI, or a test harness.

### Milestone-by-Milestone Introduction

| Milestone | Functions Added | Trigger |
|-----------|----------------|---------|
| **3a** | `backup` | EventBridge Scheduler (nightly) |
| **5** | `ingest`, `relations` | Manual invocation (CLI/admin portal → Lambda invoke) |
| **7** | `aggregate-themes` | EventBridge Scheduler (nightly) |
| **9** | `send-email`, `generate-social` | Scheduler (daily) / Manual |
| **10** | `webhook-contentful` | EventBridge Pipe (Contentful → Lambda) |
| **13** | `ingest-transcript` | Manual + Scheduler (batch) |
| **14** | `compute-graph`, `process-image`, `process-audio` | Scheduler (nightly) / Event-driven |

Infrastructure is provisioned once in Milestone 3a. Each subsequent milestone adds functions to already-provisioned infrastructure.

### CLI Wrappers

`/scripts/` retains CLI wrappers that call the same `/lib/services/` functions:

```
/scripts/
  ingest.ts              — CLI wrapper for local development/debugging
  backup.ts              — CLI wrapper
  compute-relations.ts   — CLI wrapper
  ...
```

A developer can run `pnpm run ingest --book autobiography` locally. Production runs the same logic via Lambda. The runtime is irrelevant; the business logic is identical.

### Rationale

- **Lambda is SCM-agnostic.** It works identically under GitHub Actions or any future CI system. Unlike CI-based cron jobs, Lambda infrastructure doesn't change if the portal ever migrates SCM platforms. EventBridge schedules, IAM roles, and S3 buckets are untouched by an SCM migration.
- **The portal already has an AWS footprint.** S3 (backups, Milestone 3a), Bedrock (Claude API, Arc 1), CloudFront (media streaming, Arc 6), and EventBridge are all AWS services the portal uses regardless. Lambda is the natural compute layer for an AWS-invested project.
- **Terraform-native Lambda is sufficient at this scale.** The portal has < 15 Lambda functions across all milestones. SF v4's ergonomics (local invocation, plugin ecosystem, per-function configuration) serve microservice architectures with dozens of functions. For < 15 functions, `aws_lambda_function` + `aws_lambda_layer_version` in Terraform are straightforward and eliminate a tool dependency.
- **One IaC tool, one deployment pipeline.** `terraform apply` already deploys Neon, Vercel, Sentry, and S3. Adding Lambda to the same pipeline means no new deployment workflow. CI/CD gains no new steps — Lambda deploys alongside everything else.
- **Arc 1 resolves the FTR-109 timing gap.** The backup function deploys in Arc 1 where it belongs. No more "Milestone 1a or Milestone 2a" ambiguity.
- **FTR-104 precedent.** The portal already diverges from SRF's DynamoDB pattern when the portal's needs don't match. The same principle applies: SRF ecosystem alignment is about patterns (Lambda for batch compute), not tools (SF v4 as the deployment mechanism).
- **10-year horizon (FTR-004).** Terraform is Tier 1 (effectively permanent). Serverless Framework v4 is not in any durability tier — it's a deployment tool with licensing risk and competitive pressure from SST, AWS SAM, and native Terraform. Eliminating it removes a 10-year maintenance liability.

### Alternatives Considered

1. **Keep the former Lambda batch decision unchanged (Lambda + SF v4 in Milestone 2a).** Rejected: introduces dual IaC tooling, SF v4 licensing dependency, and Milestone 2a overload. The benefits of Lambda are preserved without the deployment tool overhead.

2. **Replace Lambda entirely with CI-scheduled scripts (GitHub Actions).** Rejected: CI cron is ephemeral infrastructure tied to the SCM platform. Lambda + EventBridge is durable infrastructure managed by Terraform, SCM-agnostic.

3. **AWS SAM instead of Terraform-native Lambda.** Rejected: SAM is another CLI tool alongside Terraform. For < 15 functions, native Terraform resources are simpler.

4. **SST (open-source Serverless Framework alternative).** Considered but rejected: SST is well-designed but introduces another IaC paradigm. The portal should minimize tool surface area.

5. **AWS Step Functions for ingestion orchestration.** Deferred, not rejected. Book ingestion is a multi-step workflow (extract → chunk → embed → insert → relate → verify), but it runs ~12 times total across the portal's lifetime. A sequential script with progress logging is sufficient. If Arc 6's audio/video pipeline needs multi-step orchestration with failure recovery, Step Functions earns its place via a new ADR.

### Consequences

- The former Lambda batch decision is superseded. Its runtime decision (Lambda for batch) is preserved; its deployment tool (SF v4) and timing (Milestone 2a) are replaced.
- `/serverless/` directory becomes `/lambda/`. No `serverless.yml`. No SF v4 dependency.
- Terraform gains two modules: `/terraform/modules/lambda/` and `/terraform/modules/eventbridge/`.
- Milestone 2a deliverable M2a-22 provisions Lambda infrastructure (`enable_lambda = true` → `terraform apply`) for database backup. Milestone 3a deliverable M3a-6 deploys batch functions (ingestion, relation computation) to the already-working infrastructure.
- All downstream ADRs referencing Lambda batch infrastructure now reference FTR-107. The infrastructure is the same (Lambda + EventBridge); the deployment mechanism and timing differ.
- Developers familiar with SF v4 should note: Lambda invocation, monitoring, and IAM are identical. Only the deployment tool changes (Terraform instead of `serverless deploy`).
- **Extends FTR-106** (Terraform as sole IaC tool), **FTR-004** (10-year horizon — fewer tool dependencies), **FTR-108** (CI-agnostic scripts — `/scripts/` wrappers call same logic), **FTR-109** (backup timing resolved — Milestone 2a).
- **Deferred:** Step Functions for complex orchestration (evaluate at Arc 6 if audio/video pipeline complexity warrants it).

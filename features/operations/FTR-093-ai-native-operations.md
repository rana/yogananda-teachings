---
ftr: 93
title: AI-Native Operations
summary: "Operational architecture requirements for AI-native development including MCP evaluation criteria"
state: implemented
domain: operations
governed-by: [PRI-12]
---

# FTR-093: AI-Native Operations

## Rationale

- **Status:** Accepted
- **Date:** 2026-03-01

### Context

This portal is architected, designed, implemented, and operated by AI (Claude) under human direction — not as an experiment but as an identity commitment (PRI-12). The AI author has no persistent memory across sessions; every development session begins by reading project documents. This fundamentally shapes what "operations" means: operational knowledge must be externalized, machine-readable, and programmatically accessible.

The existing infrastructure reflects this reality implicitly — 120+ ADRs as institutional memory, structured health endpoints, deployment scripts, gated-loading documentation architecture (FTR-084). But these choices were made individually without a governing decision that articulates *why* the system is built this way. Without that governing decision, each operational tool must justify itself independently rather than deriving from a shared architectural requirement.

MCP (Model Context Protocol) servers provide the AI operator with direct programmatic access to infrastructure services. FTR-083 established MCP as "development tooling." PRI-12 elevates MCP to operational infrastructure — the AI operator's primary interface to the running system.

### Decision

Codify the operational architecture requirements that follow from PRI-12: AI-native development and operations.

#### 1. MCP Service Evaluation Criteria

Every managed service integral to **routine operations** requires MCP integration or equivalent API access. The distinction:

| Operation Type | MCP/API Required? | Examples |
|---|---|---|
| **Routine operations** | Yes — must be programmatic | Database migrations, content sync, error monitoring, deployment, branch management, SQL execution |
| **One-time configuration** | Preferred but GUI acceptable | Initial account creation, tier selection, billing setup, OIDC configuration |
| **Emergency operations** | Yes — must be programmatic | Rollback, incident triage, health diagnostics |

**Service adoption gate:** When evaluating a new service, include this question: "Can the AI operator manage routine operations programmatically?" A service that requires dashboard-only management for routine operations is disqualified from core infrastructure unless it provides CLI or API alternatives.

**Current MCP integrations:**

| MCP Server | Service | Operations Covered | Status |
|---|---|---|---|
| Neon | Database | Branch management, SQL execution, schema diffs, migration safety, connection strings | Active |
| Sentry | Error monitoring | Error investigation, stack traces, breadcrumbs | STG-001 |
| Contentful | CMS | Content model queries, entry management, webhook debugging | STG-001+ |
| SRF Corpus | Search corpus | AI consumer access to search, themes, graph | Unscheduled (FTR-098) |

**CLI/API equivalents (non-MCP):**

| Tool | Service | Operations Covered |
|---|---|---|
| `aws` CLI | AWS | S3, Secrets Manager, IAM, OIDC — via Bash |
| `vercel` CLI | Vercel | Deployment, environment variables, project linking |
| `gh` CLI | GitHub | Issues, PRs, Actions, secrets |
| Platform MCP | All infrastructure | Infrastructure provisioning, environment management |

#### 2. Machine-Readable Operations Standards

All operational surfaces must be designed for AI consumption:

- **Health endpoints** return structured JSON with typed fields (status, version, dependencies, latency), not HTML status pages (FTR-082, FTR-096)
- **Deploy manifests** are JSON with version, timestamp, stage, blast tier, design refs, commit count (FTR-096 § deploy-manifest.json)
- **Structured logging** uses JSON format with request ID correlation (FTR-082, `/lib/logger.ts`)
- **Error diagnostics** include structured context — stack traces, request metadata, breadcrumbs — accessible via Sentry MCP
- **Document integrity validation** outputs machine-parseable results (FTR-096 § doc-validate.sh)
- **Release tags** carry structured metadata: version, stage, design refs, blast tier (FTR-096 § release-tag.sh)

**Standard:** Every operational output that the AI operator consumes must be parseable without heuristic text extraction. If an output requires regex to interpret, it needs structured alternatives.

#### 3. Documentation-as-Infrastructure

The documentation architecture (FTR-084) is not a process artifact — it is operational infrastructure for an AI-native system:

- **CLAUDE.md** is the operator's boot sequence — loaded at every session start, carrying compressed forms of all principles, conventions, and references
- **Gated loading** prevents context-window saturation — load what the task requires, not the entire corpus
- **Design files** are the architect's specifications — they carry the system's current state, not its history
- **ADR maturity classification** signals which decisions are active vs. provisional, so the AI operator allocates attention correctly
- **Session memory** (`~/.claude/projects/*/memory/`) carries cross-session continuity that documents alone cannot

**Consequence:** Documentation maintenance (the table in CLAUDE.md § Document Maintenance) is not optional cleanup — it is operational upkeep. Drift in documentation is equivalent to drift in monitoring: it degrades the operator's situational awareness.

#### 4. Operational Script Standards

Scripts are the AI operator's primary execution interface. All operational scripts:

- Accept `--json` flag for machine-readable output (default: human-readable)
- Return non-zero exit codes on failure
- Include `--dry-run` where destructive
- Are CI-agnostic (FTR-108) — no GitHub Actions-specific assumptions
- Are documented in FTR-096 with input/output specifications

Current operational scripts (all STG-001/1c deliverables):

| Script | Purpose | Deliverable |
|---|---|---|
| `status.sh` | AI self-orientation at session start | STG-001-10 |
| `doc-validate.sh` | Cross-reference integrity validation | STG-001-9 |
| `release-tag.sh` | Annotated tags with design refs | STG-001-11 |
| `deploy.sh` | Full deployment ceremony | STG-003-18 |

#### 5. Service Adoption Gate Checklist

When evaluating a new service for the portal infrastructure:

- [ ] Does it have MCP integration, CLI, or API for routine operations?
- [ ] Can the AI operator manage it without GUI interaction for day-to-day work?
- [ ] Can it be platform-managed for infrastructure state?
- [ ] Does it emit structured (JSON) logs or metrics?
- [ ] Does it support webhook or event-driven integration?

A "no" on the first two items is a disqualifier for core infrastructure. Dashboard-only services may serve auxiliary roles (e.g., billing, one-time configuration) but cannot be the sole interface for routine operations.

### Consequences

- PRI-12 has a governing ADR that other ADRs can reference for operational architecture requirements
- MCP is elevated from "development tooling" (FTR-083) to operational infrastructure
- Service adoption includes a programmatic-access gate
- Operational scripts are first-class deliverables with specified output formats
- Documentation maintenance is framed as operational upkeep, not optional cleanup
- **Extends:** FTR-083 (MCP strategy), FTR-082 (observability), FTR-084 (documentation architecture), FTR-096 (operational surface)
- **Governed by:** PRI-12 (AI-Native Development and Operations)

## Notes

**Provenance:** FTR-093 → FTR-093

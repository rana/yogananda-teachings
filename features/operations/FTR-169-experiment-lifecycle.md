---
ftr: 169
title: "Experiment Lifecycle and Platform Integration"
summary: "Experiment-as-repository lifecycle with GitHub-native audit trail and platform orchestration"
state: proposed
domain: operations
governed-by: [PRI-12, PRI-08]
depends-on: [FTR-168, FTR-093]
re-evaluate-at: M3d boundary
---

# FTR-169: Experiment Lifecycle and Platform Integration

## Rationale

Every autonomous agent experiment needs a lifecycle: creation, research, design, build, validation, deployment, review, and disposition (promote or decline). The platform (yogananda-platform) already provides environment lifecycle management. This FTR extends it with experiment-specific orchestration, GitHub-native audit trails, and email notifications.

The key insight: each experiment IS a GitHub repository (or branch). Git history IS the audit trail. Every agent action is a commit, every stage transition is a tag, every human review is a PR comment.

## Specification

### Experiment States

```
proposed → researching → designing → building → validating → deployed →
reviewing → [revised → redeployed]* → approved → merged | declined
```

Each state transition: logged in platform DB, triggers notification, updates ops dashboard.

### Experiment-as-Repository

Standalone experiments get a new GitHub repo. Feature experiments get a branch from the target project's dev branch. Hash-based experimental domains: `{hash}.experiments.yogananda.tech`.

Repository structure includes `.experiment/` directory with config, prompt, research artifacts, design artifacts, validation gate results, cost tracking (token-usage.jsonl), and agent session transcripts.

### Platform Extensions Needed

| Capability | Extension |
|-----------|-----------|
| Repo creation | `project_create` MCP tool auto-creates GitHub repo from template |
| Hash domains | Mark as experimental, auto-assign subdomain |
| Experiment registry | New DB table: experiments (prompt, workflow, status, costs, outcomes) |
| Email notifications | AWS SES or Resend, triggered at state transitions. Design constraints: FTR-176 (calm notifications, digest mode, quiet hours, SPF/DKIM/DMARC). |
| Notification service | Template engine, quiet hours scheduler, digest batching, channel routing. Owned by platform; constrained by FTR-176. |
| Agent execution | Claude Code SDK sessions orchestrated by DAG executor |
| Merge to dev | `experiment_promote` MCP tool with manual approval gate |
| Decline with record | Preserve as institutional memory with archive tag |

### New MCP Tools

```
experiment_create, experiment_list, experiment_describe,
experiment_promote, experiment_decline, experiment_compare
```

### Lore Protocol for Enriched Git Commits

Every agent commit carries structured git trailers as knowledge channels between agents (Claude Prompt 1 finding). Trailers encode: intent, constraints, rejected alternatives, confidence level. Git history becomes machine-readable institutional memory, not just a change log.

```
feat: implement convocation schedule component

Renders event schedule with timezone-aware display.

Intent: Display schedule grouped by day with session details
Constraints: No client-side date manipulation (SSR only, PRI-05)
Rejected: Full calendar widget (too heavy for 2G, violates bundle budget)
Confidence: 0.85
Agent: frontend-engineer
Stage: build
```

### Infrastructure Garbage Collection

Automated cleanup for abandoned experiments' cloud resources. Experiments have a TTL (default 30 days). After TTL: Neon branch deleted, Vercel deployment removed, DNS entry cleared, GitHub repo archived. Platform tracks all provisioned resources per experiment for deterministic teardown. Prevents experiment sprawl consuming infrastructure budget.

### Per-Experiment Resource Isolation

Each experiment receives isolated resources to prevent cross-experiment interference:
- **Bedrock:** Application Inference Profiles for per-experiment token attribution
- **Neon:** Dedicated database branch (existing platform capability)
- **Vercel:** Dedicated deployment with hash-based domain
- **Deployment queue:** Experiments don't block each other's deployments

### Experiment Cloning

Experiments can be cloned for comparison (FTR-173 depends on this). `experiment_clone` creates a new experiment with the same prompt and workflow but different parameters (model selection, role assignments, skill versions). The clone shares the original's research artifacts (read-only reference) but gets its own repo/branch, environment, and cost tracking.

Clones are linked in the experiment registry for comparison queries. The original is the "baseline"; clones are "variants."

### Additional MCP Tools

```
experiment_clone    — Clone experiment with parameter overrides
experiment_extend   — Extend TTL for experiment under active review
experiment_resources — List all provisioned resources for an experiment
```

### Scaling

Pure GitHub works to ~100 experiments/month. At 1,000+: compress session transcripts, aggregate costs in platform Neon DB, auto-archive after 90 days of inactivity. S3 Glacier for cold storage of raw transcripts only if needed.

## Edge Cases

- **TTL expiry during active review.** A monastic is prayerfully considering feedback over several weeks. The 30-day TTL fires. Resolution: experiments in `reviewing` state have TTL paused. TTL only counts time in `deployed` state with no human activity. `experiment_extend` MCP tool allows manual TTL extension with reason.
- **Concurrent experiments on the same base branch.** Two experiments branch from `dev`, both modify the same component. Both get promoted. Git merge conflict during `experiment_promote`. Resolution: `experiment_promote` runs a dry-run merge check first. If conflicts exist, the experiment enters `merge_conflict` state with a diff summary. Staff decides: merge manually, rebase on the other experiment, or decline one.
- **Experiment references external experiment's output.** Experiment B depends on Experiment A's research artifacts. If Experiment A is declined and garbage-collected, Experiment B loses its research foundation. Resolution: cloned/referenced artifacts are copied into the dependent experiment's repo (not symlinked). Independence over deduplication.
- **Hash domain collision.** Two experiments get the same hash prefix for their experimental domain. Statistically improbable with SHA-256 truncation, but not impossible. Resolution: the platform checks for domain uniqueness before assignment; append a counter suffix if collision detected.

## Error Cases

- **Failed state transition with partial resource creation.** `experiment_create` provisions a GitHub repo and Neon branch but fails during Vercel deployment. The experiment exists in an inconsistent state — some resources provisioned, others not. Resolution: `experiment_create` is transactional. On failure, it rolls back all provisioned resources (delete repo, delete Neon branch) and returns an error. The durable execution layer (FTR-170) handles retry of the entire creation.
- **Orphaned resources from manual debugging.** During debugging, a developer manually creates a Neon branch or Vercel deployment outside the experiment's tracked resources. Garbage collection misses it. Resolution: periodic reconciliation job compares all cloud resources (Neon branches, Vercel deployments, DNS entries) against the experiment registry. Orphaned resources are flagged for manual review (not auto-deleted — they might be intentional).
- **Lore protocol trailer parsing failure.** An agent produces a malformed git trailer (missing colon, invalid confidence value). Downstream agents that parse trailers fail. Resolution: trailer parsing is lenient — extract what's valid, log what's malformed. Malformed trailers reduce the experiment's quality score but don't block the pipeline.
- **`experiment_promote` during platform maintenance.** Staff clicks promote while the platform database is under maintenance. The promotion partially writes to the DB but the PR creation fails. Resolution: promotion is a two-phase operation — first create the PR (idempotent), then update the DB. If the DB update fails, the PR exists and can be completed when the DB recovers.

## Notes

Full detail: `docs/plans/ftr-168-ai-agent-platform.md` sections 5, 25.

GitHub chosen over S3 because: native versioning, diffs, PR review, Claude Code native git access, platform already manages repos, searchability, collaboration model, and zero additional cost.

**Research-informed additions (2026-03-18):** Lore protocol (Claude Prompt 1), infrastructure garbage collection (both Prompt 1 reports cite experiment sprawl as operational risk), per-experiment resource isolation (Bedrock inference profiles for cost attribution — AWS native, no custom tracking).

# FTR-108: CI-Agnostic Deployment Scripts

**State:** Approved
**Domain:** foundation
**Arc:** 1+
**Governed by:** PRI-10

## Rationale

### Context

CI pipeline logic should not be embedded in CI-specific YAML syntax. If the portal ever migrates SCM platforms (e.g., GitHub → GitLab for SRF IDP alignment), CI-embedded logic requires rewriting every pipeline step. More immediately, CI-agnostic scripts enable local execution parity — a developer can run `./scripts/db-migrate.sh` locally with the same logic CI uses.

### Decision

Add a `scripts/` directory with CI-system-agnostic deployment scripts. GitHub Actions (and any future CI) calls these scripts rather than embedding logic in workflow YAML.

#### Directory structure

```
/scripts/
  db-migrate.sh           — Run dbmate migrations against a given database URL
  smoke-test.sh           — Run smoke tests against a deployed environment
  search-quality.sh       — Run the search quality evaluation suite
  neon-branch-cleanup.sh  — Delete orphaned Neon preview branches (TTL enforcement)
```

#### CI workflow pattern

```yaml
# GitHub Actions
steps:
  - run: ./scripts/db-migrate.sh $NEON_DATABASE_URL
  - run: ./scripts/smoke-test.sh $DEPLOYMENT_URL
```

The CI config is a thin orchestration layer. The scripts contain the actual logic. If SCM migration occurs, only the CI config changes — scripts are identical.

#### Multi-environment promotion pipeline

For Arc 4+ with three environments (dev/staging/prod):

```
PR → dev (auto) → staging (manual gate) → prod (manual gate)
```

Each promotion runs:
1. `db-migrate.sh {env}` — run migrations against target environment's database
2. Vercel deployment to target environment's project
3. `smoke-test.sh {env}` — verify the deployment

Migration sequencing: Platform MCP provisions infrastructure *first* (in case it creates the database), then dbmate migrations (which depend on the database existing), then Vercel deploys the new code (which depends on the new schema).

### Rationale

- **SCM portability.** Any future SCM migration becomes a CI config swap, not a logic rewrite.
- **Local reproducibility.** Developers can run `./scripts/db-migrate.sh` locally. CI parity with local execution prevents "works on my machine" issues.
- **Testability.** Scripts can be tested independently of the CI system. ShellCheck lint in CI catches script errors.

### Consequences

- `/scripts/` directory added to repo in Milestone 1a
- GitHub Actions workflows call scripts instead of inline commands
- All scripts accept environment name as parameter, defaulting to `dev`
- **Extends FTR-106** (Platform MCP) with concrete deployment orchestration

**Operational surface extension:** FTR-096 adds `deploy.sh` (deployment ceremony), `release-tag.sh` (semantic tagging), `doc-validate.sh` (document integrity), and `status.sh` (AI self-orientation) to the `/scripts/` directory — following the same CI-agnostic pattern. See FTR-096, FTR-096, FTR-096.

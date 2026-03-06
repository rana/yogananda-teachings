---
ftr: 80
title: Engineering Standards
state: approved
domain: operations
arc: 1+
governed-by: [PRI-10, PRI-12]
---

# FTR-080: Engineering Standards

## Rationale

### Context

The teaching portal is the first project built on SRF's new stack (Next.js + Vercel + Contentful + Neon). Patterns established here will influence every SRF project that follows. Beyond technology choices, engineering conventions — how projects are documented, how decisions are recorded, how AI assistants are given context — determine whether the codebase remains maintainable years after the original team has moved on.

The portal has developed a documentation approach (CLAUDE.md, CONTEXT.md, DECISIONS.md, ROADMAP.md) that serves both human developers and AI-assisted development tools. This should be standardized as the SRF project template.

### Decision

Establish the following engineering standards for all SRF projects:

#### Project Documentation Template

Every SRF repository includes these files at the root:

| File | Purpose | Audience |
|------|---------|----------|
| **CLAUDE.md** | AI context file. Project identity, tech stack, constraints, current status. | AI assistants (Claude Code, Copilot, etc.) and human onboarding |
| **CONTEXT.md** | Mission, stakeholders, ethical constraints, organizational context. | Humans (product, leadership, new team members) and AI |
| **DECISIONS.md** | Architecture Decision Records with full rationale for every significant choice. | Future developers asking "why?" |
| **ROADMAP.md** | Phased plan with deliverables, success criteria, and open questions. | Project management, stakeholders, AI context |

#### Code Organization Conventions

| Convention | Rule |
|------------|------|
| **Service layer** | Business logic in `/lib/services/`. Never in Server Components or Route Handlers directly. (FTR-015) |
| **API versioning** | `/api/v1/` prefix on all routes. |
| **Structured logging** | JSON logs with consistent schema: `{ route, method, statusCode, durationMs, requestId }`. Implemented via a shared `lib/logger.ts`. |
| **String externalization** | All UI strings in `messages/{locale}.json`. No hardcoded strings in components. (FTR-058) |
| **CSS logical properties** | `ms-*`/`me-*` instead of `ml-*`/`mr-*`. `start`/`end` instead of `left`/`right`. (FTR-058) |
| **Accessibility baseline** | WCAG 2.1 AA. axe-core in CI. No merge with critical or serious violations. (FTR-003) |

#### Database Migration Convention

Numbered SQL migration files in `/migrations/`:

```
migrations/
 001_initial_schema.sql
 002_add_places_table.sql
 003_add_chunk_places.sql
```

Applied via **dbmate** (SQL-based, no ORM lock-in) or Drizzle ORM migrations. Every migration is reviewed in Git, tested against a Neon branch, and reversible.

#### Dependency Management

- **Renovate** (or Dependabot) configured on all repos for automated dependency update PRs
- Pin to specific versions (not ranges) for production dependencies
- Quarterly review of major version upgrades (especially Next.js)

### Rationale

- **Onboarding speed.** A new developer (or AI assistant) can understand any SRF project by reading four files. No tribal knowledge required.
- **Decision archaeology.** ADRs answer "why?" years later. Without them, teams revisit settled decisions, wasting time and risking regression.
- **AI context engineering.** CLAUDE.md is not just for Claude — it's a machine-readable project summary that benefits any LLM-assisted tool. As AI-assisted development becomes standard, projects with good context files get dramatically better AI contributions.
- **Consistency across projects.** SRF has multiple properties (convocation site, portal, future projects). Shared conventions mean developers can move between projects without relearning patterns.
- **Longevity.** The portal may be maintained for a decade. Conventions that seem like overhead now pay for themselves many times over as team members change.

### Consequences

- The teaching portal's documentation structure becomes the SRF template
- New SRF repos are initialized with CLAUDE.md, CONTEXT.md, DECISIONS.md, ROADMAP.md stubs
- The SRF AE team should review and adopt these standards for existing and new projects
- Migration tooling (dbmate or Drizzle) is chosen in Arc 1
- Renovate/Dependabot configured from the first commit

## Notes

**Provenance:** FTR-080 → FTR-080

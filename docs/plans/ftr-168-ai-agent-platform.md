# AI Agent Platform — Architectural Vision

## Context

SRF IT needs to empower staff, monastics, and YSS partners to create digital applications autonomously — from a Yearly Convocation website to proof-of-concepts to full products. Today, three repos form the foundation: **yogananda-teachings** (portal + 43 skills + 164 FTRs), **yogananda-platform** (27 MCP tools, environment engine, review overlay, cost tracking), and **yogananda-design** (design tokens, semantic language, pattern library). The vision: an operations portal where a staff member enters a prompt and a team of AI agents builds an entire end-to-end application, with email delivery of results.

This document captures the complete architectural vision across all dimensions the user raised. It is a **strategic proposal** — not an implementation plan for a single stage. It would become one or more FTR files and inform multiple future stages.

---

## 1. The Staff Experience (North Star)

A staff member opens `yogananda.tech/ops`, clicks "New Experiment," and sees:

1. **Pre-populated prompt templates** — "Build Convocation 2027 website," "Create meditation retreat registration page," "Build Smara camp landing page." Each template is editable, with known-good framing.
2. They **edit the prompt** or write their own. Optional: attach user stories, reference images, brand guidelines.
3. They **select a workflow template** — "Full autonomous build," "Research only," "Design exploration," "Feature addition to existing project." Elements within each workflow are toggleable (enable/disable deep research, skip visual design, add compliance check).
4. They **choose model options** — default is cost-optimized (Sonnet for implementation, Opus for review), but they can select all-Opus for maximum quality or mix in open-source models for cost comparison.
5. They click **Run**. The platform:
   - Creates a GitHub repo (or branches from an existing project's dev branch)
   - Assigns a commit-hash-based experimental domain (`abc123.experiments.yogananda.tech`)
   - Spins up a full environment (Neon branch, Vercel deployment, DNS)
   - Executes the agent workflow pipeline
   - Sends **email notifications** at key stages (research complete, design ready for review, build deployed, CI checks passed)
6. They **review the result** at the experimental URL. Use the review overlay to leave comments. AI agents process feedback and redeploy.
7. When satisfied, they click **Promote to Dev** (requires manual approval). Or **Decline** (preserved as institutional record).

---

## 2. Agent Workflow Architecture

### 2.1 Workflow as Pipeline

Every workflow is a **directed acyclic graph (DAG)** of stages. Each stage runs one or more agents. Stages can fan out (parallel) and fan in (merge). The platform provides templates; staff can modify or create new ones.

```
┌─────────────┐
│   TRIGGER    │  Staff prompt + workflow template + model selection
└──────┬──────┘
       │
┌──────▼──────┐
│  RESEARCH   │  Deep Research agents (Claude + Gemini APIs)
│  (fan-out)  │  Survey prior art, analyze requirements, find gaps
└──────┬──────┘
       │
┌──────▼──────┐
│   DESIGN    │  Product Designer + Visual Designer + Architect agents
│  (fan-out)  │  Wireframes, design tokens, component architecture
└──────┬──────┘
       │
┌──────▼──────┐
│  MEDIATION  │  Mediator agent synthesizes design outputs
│  (fan-in)   │  Resolves conflicts, produces unified spec
└──────┬──────┘
       │
┌──────▼──────┐
│    BUILD    │  Engineer agents (Claude Code as substrate)
│ (sequential)│  Scaffold → implement → test → style
└──────┬──────┘
       │
┌──────▼──────┐
│  VALIDATE   │  CI checks + AI validation agents (fan-out)
│  (fan-out)  │  Tests, accessibility, compliance, architecture coherence
└──────┬──────┘
       │
┌──────▼──────┐
│   DEPLOY    │  Platform MCP: environment_create, deploy, DNS
└──────┬──────┘
       │
┌──────▼──────┐
│   NOTIFY    │  Email summary + live URL + review instructions
└─────────────┘
```

### 2.2 Workflow Configuration

> **Format decision:** JSONC recommended over YAML — see Section 17 for full format comparison matrix (YAML, TOML, JSONC, JSON5, Markdown, TypeScript, KDL, CUE). JSONC chosen because LLMs produce valid JSON more reliably than any other format; YAML indentation is the #1 source of AI-generated config errors.

```jsonc
// Example: convocation-site.workflow.jsonc
{
  "name": "Convocation 2027 Website",
  "template": "full-autonomous-build",
  "prompt": "Build the SRF Yearly Convocation 2027 website. Include:\n- Event schedule with session details\n- Speaker/presenter profiles\n- Registration information and links\n- Venue and travel information\n- Photo gallery from previous years\n- Mobile-responsive, accessible (WCAG 2.1 AA)\n- SRF visual identity (Navy, Gold, Cream)",

  "stages": {
    "research": {
      "enabled": true,
      "agents": ["deep-researcher"],
      "config": {
        "platforms": ["claude", "gemini"],
        "topics": ["SRF convocation history", "event website best practices", "spiritual conference accessibility"]
      }
    },

    "design": {
      "enabled": true,
      "agents": ["product-designer", "visual-designer", "architect"],
      "fan": "parallel",
      "config": {
        "design_system": "yogananda-design",
        "brand": "srf"
      }
    },

    "mediate": {
      "enabled": true,
      "agents": ["design-mediator"],
      "fan": "merge"
    },

    "build": {
      "enabled": true,
      "agents": ["engineer"],
      "config": {
        "substrate": "claude-code",
        "model": "sonnet",
        "skills": ["implement", "verify", "scope"]
      }
    },

    "validate": {
      "enabled": true,
      "agents": ["qa-agent", "accessibility-agent", "compliance-agent", "architecture-agent"],
      "fan": "parallel",
      "config": {
        "gates": [
          "tests_pass",
          "axe_core_zero_violations",
          "no_new_cloud_services",
          "design_system_compliance",
          "principles_alignment"
        ]
      }
    },

    "deploy": {
      "enabled": true,
      "config": {
        "branch_from": "dev",
        "domain": "auto"
      }
    },

    "notify": {
      "enabled": true,
      "config": {
        "channels": ["email"],
        "recipients": ["requester"],
        "include": ["live_url", "research_summary", "cost_report"]
      }
    }
  },

  "models": {
    "default": "sonnet",
    "review": "opus",
    "research": "opus"
  }
}
```

### 2.3 Workflow Templates (Pre-populated)

| Template | Stages Enabled | Use Case |
|----------|---------------|----------|
| **Full Autonomous Build** | All | New standalone site (Convocation, retreat, campaign) |
| **Feature Addition** | Research → Build → Validate → Deploy | Add feature to existing project |
| **Research Only** | Research → Notify | Deep research report with synthesis |
| **Design Exploration** | Research → Design → Notify | Visual concepts without implementation |
| **Proof of Concept** | Design → Build → Deploy → Notify | Quick prototype, skip deep research |
| **CI Validation** | Validate only | Run AI validation battery on existing branch |
| **Content Site** | Research → Build → Deploy → Notify | Content-heavy site from provided materials |

Staff can create custom templates. Saved templates become organizational assets.

---

## 3. Agent Roles

### 3.1 Role Registry

Each role has: a system prompt, a reading strategy, permitted tools, output contract, and model recommendation. Roles are **versioned and auditable** — every prompt change is tracked.

| Role | Focus | Phase | Model Default | Key Skills |
|------|-------|-------|---------------|------------|
| **Deep Researcher** | Survey fields, find gaps, synthesize | Research | Opus | explore, archaeology, gaps |
| **Product Designer** | User stories, information architecture, flows | Design | Opus | seeker-ux, scope, invoke |
| **Visual Designer** | Typography, color, layout, component design | Design | Opus | cultural-lens, invoke |
| **Architect** | System design, data model, API contracts | Design | Opus | scope, consequences, threat-model |
| **Design Mediator** | Resolve conflicts between parallel design outputs | Mediation | Opus | crystallize, converge, review |
| **Engineer** | Implementation (Claude Code substrate) | Build | Sonnet | implement, verify, ghost |
| **DevOps Engineer** | CI/CD, deployment, infrastructure | Build/Deploy | Sonnet | ops-review, drift-detect |
| **QA Agent** | Test generation, test execution, regression | Validate | Sonnet | verify, deep-review |
| **Accessibility Agent** | WCAG compliance, screen reader, keyboard nav | Validate | Sonnet | seeker-ux, cultural-lens |
| **Compliance Agent** | PRI alignment, no new cloud services, tech stack limits | Validate | Haiku | mission-align, review |
| **Architecture Coherence** | No scope creep, pattern consistency, dependency hygiene | Validate | Sonnet | drift-detect, supply-chain-audit |
| **Production Engineer** | Instrumentation, telemetry, failure scenarios, Sentry/NR integration | Validate/Ops | Sonnet | ops-review, incident-ready, ghost |
| **Database Administrator** | Schema design, query plans, vacuum, indexes, monitoring | Validate/Ops | Sonnet | db (project command), threat-model |
| **Principles Validator** | Every output checked against PRI-01–12 | Validate | Opus | mission-align, review |
| **Rural 2G Tester** | Performance on constrained devices, bandwidth budgets | Validate | Sonnet | seeker-ux (with 2G constraint lens) |
| **Stakeholder Communicator** | Non-technical summaries, decision points | Notify | Sonnet | stakeholder-brief |
| **Executive Reviewer** | High-level quality, mission alignment, cost assessment | Review | Opus | deep-review, mission-align |

### 3.2 Role Management

- Staff can **assign roles per workflow stage** (sensible defaults pre-selected)
- Staff/AI can **create new roles** — provide a prompt, reading strategy, tool permissions
- **Role ecosystem** — preserved library of all roles (active, experimental, retired)
- Roles have **cost profiles** — estimated tokens per invocation, helping staff make cost-value decisions
- **A/B testing** — run same workflow with different role assignments, compare outputs

### 3.3 Adversarial Roles (Protection)

Dedicated agents that stress-test outputs before delivery:

| Adversarial Role | What It Breaks |
|-----------------|----------------|
| **Chaos Engineer** | Infrastructure failure scenarios, service degradation |
| **Security Auditor** | OWASP top 10, dependency vulnerabilities, secret exposure |
| **Accessibility Attacker** | Screen reader failures, keyboard traps, color contrast |
| **Performance Saboteur** | JS bundle bloat, unoptimized images, N+1 queries |
| **Content Integrity** | Orphaned quotes, missing attribution, paraphrase detection |
| **Scope Creep Detector** | New cloud services, unauthorized dependencies, feature overreach |

---

## 4. Deep Research Integration

### 4.1 Dual-Platform Research

The portal already demonstrates the power of dual deep research (Claude + Gemini) with 10+ reference documents produced this way. Systematize this:

```
Research Phase
├── Claude Deep Research API
│   └── Produces: claude-research-{topic}.md
├── Gemini Deep Research API
│   └── Produces: gemini-research-{topic}.md
└── Synthesis Agent (Opus)
    ├── Reads both reports
    ├── Identifies convergences and divergences
    ├── Produces: synthesis-{topic}.md
    └── Flags gaps neither platform found
```

### 4.2 Research Prompt Design

Claude AI designs the deep research prompts — this is essential (empirically validated in this project). The workflow:

1. Staff provides a topic or question
2. **Prompt Designer agent** (Opus) crafts optimized deep research prompts for both platforms
3. Prompts are logged as artifacts (auditable, improvable)
4. Research executes on both platforms
5. Synthesis produces unified findings with confidence levels

### 4.3 Research as Exploration Phase

Before any planning or building, research answers:
- What exists in this space?
- What are seekers/staff actually trying to accomplish?
- What gaps exist in current understanding?
- What would a world-class version look like?
- What are we not asking?

---

## 5. Platform Integration (yogananda-platform)

### 5.1 Experiment Lifecycle

The platform already provides the infrastructure engine. Extend it:

```
Experiment States:
  proposed → researching → designing → building → validating → deployed →
  reviewing → [revised → redeployed]* → approved → merged | declined

Each state transition:
  - Logged in platform DB (new table: experiments)
  - Triggers email notification
  - Updates ops dashboard
```

### 5.2 New Platform Capabilities Needed

| Capability | Current State | Extension |
|-----------|--------------|-----------|
| **Repo creation** | Manual | `project_create` MCP tool auto-creates GitHub repo from template |
| **Hash domains** | Branch deployments exist | Mark as `experimental`, auto-assign `{hash}.experiments.yogananda.tech` |
| **Experiment registry** | Not exists | New DB table: experiments (prompt, workflow, status, costs, outcomes) |
| **Email notifications** | Not exists | AWS SES or Resend integration, triggered at state transitions |
| **Agent execution** | Not exists | Lambda-based or long-running agent orchestrator |
| **Cost tracking** | Per-project exists | Per-experiment token attribution (Bedrock token tracking) |
| **Merge to dev** | Manual | Platform MCP `experiment_promote` with approval gate |
| **Decline with record** | Not exists | Preserve experiment as institutional memory |

### 5.3 Ops Dashboard Extensions

New section on `yogananda.tech/ops`:

- **Experiments** — List of all experiments (active, completed, declined)
- Per experiment: prompt, workflow visualization, agent outputs, cost, live URL, review status
- **Pre-populated prompt library** — Browse, edit, run
- **Workflow designer** — Visual DAG editor for pipeline stages (connect stages, assign agents)
- **Model cost comparison** — Side-by-side: same experiment with different models, quality ratings

---

## 6. CI/AI Validation Gates

Every stage can have AI-powered validation. These run as part of the pipeline, not after.

### 6.1 Validation Agents as CI Checks

```jsonc
{
  "validation_gates": [
    // Traditional CI
    { "name": "tests_pass", "type": "ci", "command": "pnpm test" },
    { "name": "type_check", "type": "ci", "command": "pnpm tsc --noEmit" },
    { "name": "lint", "type": "ci", "command": "pnpm lint" },

    // AI validation gates
    {
      "name": "principles_alignment",
      "type": "ai-agent",
      "role": "principles-validator",
      "model": "opus",
      "prompt": "Review this codebase against PRI-01 through PRI-12. Flag any violations."
    },
    {
      "name": "accessibility_audit",
      "type": "ai-agent",
      "role": "accessibility-agent",
      "model": "sonnet",
      "prompt": "Run axe-core, then review every component for WCAG 2.1 AA compliance."
    },
    {
      "name": "architecture_coherence",
      "type": "ai-agent",
      "role": "architecture-agent",
      "model": "sonnet",
      "prompt": "Verify no new cloud services, no scope creep, pattern consistency with existing codebase."
    },
    {
      "name": "design_system_compliance",
      "type": "ai-agent",
      "role": "visual-designer",
      "model": "sonnet",
      "prompt": "Verify all components use yogananda-design tokens. No hardcoded colors, no custom fonts."
    },
    {
      "name": "rural_2g_test",
      "type": "ai-agent",
      "role": "rural-2g-tester",
      "model": "sonnet",
      "prompt": "Verify JS < 100KB, FCP < 1.5s on 3G, all images optimized, progressive enhancement."
    },
    {
      "name": "security_audit",
      "type": "ai-agent",
      "role": "security-auditor",
      "model": "sonnet",
      "prompt": "OWASP top 10 review. Check for XSS, injection, secret exposure, dependency vulnerabilities."
    }
  ]
}
```

### 6.2 Regression Detection

After each agent build cycle, a **regression agent** compares:
- Before/after test counts
- Before/after bundle size
- Before/after Lighthouse scores
- Before/after accessibility violations
- Before/after security findings

Blocks promotion if regression detected.

---

## 7. Comparative Analysis Engine

### 7.1 Model Comparison

Run the same prompt/workflow with different models. Opus rates all outcomes.

```
Experiment: "Build Convocation 2027 site"
├── Run A: Engineer=Sonnet, Review=Opus     → Cost: $4.20, Quality: 8.2/10
├── Run B: Engineer=Opus, Review=Opus       → Cost: $18.50, Quality: 9.1/10
├── Run C: Engineer=Haiku, Review=Sonnet    → Cost: $0.85, Quality: 5.7/10
└── Run D: Engineer=DeepSeek, Review=Opus   → Cost: $1.20, Quality: 6.4/10

Opus Meta-Review:
  "Run A provides optimal cost/quality. Run B justified only for
   mission-critical production. Run C/D insufficient for SRF quality bar."
```

### 7.2 Workflow Comparison

Same goal, different orchestration strategies:

```
Strategy A: Sequential narrow agents (research → design → build → validate)
Strategy B: Parallel agent teams (research+design fan-out → build → validate)
Strategy C: Single broad agent (one Opus agent does everything)

Compare: Time to completion, cost, quality, coherence, test coverage
```

### 7.3 Prompt Comparison

Different prompts for the same sophisticated outcome:

```
Prompt A: Detailed user stories with acceptance criteria
Prompt B: High-level vision statement with examples
Prompt C: Reference to existing site + "make it better"

Compare: Output quality, adherence to intent, creative latitude
```

All comparisons stored as institutional data. Over time, the organization builds empirical knowledge about what works.

---

## 8. Audit Trail and Institutional Memory

### 8.1 Complete Audit Chain

Every experiment produces:

```
experiment-{id}/
├── prompt.md                    # Original staff input
├── workflow.yaml                # Pipeline configuration
├── research/
│   ├── claude-research.md       # Claude deep research output
│   ├── gemini-research.md       # Gemini deep research output
│   └── synthesis.md             # Merged findings
├── design/
│   ├── product-design.md        # User stories, IA, flows
│   ├── visual-design.md         # Component specs, tokens
│   └── architecture.md          # System design, data model
├── mediation/
│   └── unified-spec.md          # Resolved design spec
├── build/
│   ├── agent-sessions/          # Every Claude Code session transcript
│   └── commits/                 # Git log with agent attribution
├── validation/
│   ├── ci-results.json          # Traditional CI output
│   ├── ai-gate-results/         # Each AI validator's findings
│   └── regression-report.md     # Before/after comparison
├── reviews/
│   ├── human-comments.json      # Staff review overlay comments
│   └── ai-revisions/           # Agent responses to feedback
├── costs/
│   ├── token-usage.json         # Per-agent, per-model token counts
│   └── cost-summary.md          # Total cost with breakdown
├── decisions/
│   └── decisions.md             # Auto-generated ADRs for significant choices
└── meta/
    ├── experiment-log.jsonl     # Timestamped event stream
    └── quality-rating.json      # Opus meta-review scores
```

### 8.2 Decision-to-Implementation Traceability

Every code change traces back to:
- The experiment prompt (why this exists)
- The research that informed it (what we learned)
- The design decision (what we chose and why)
- The validation that confirmed it (how we know it works)
- The human who approved it (who is accountable)

### 8.3 Mining for Improvements

AI agents periodically analyze the experiment archive:
- Which prompt patterns produce the best outcomes?
- Which model combinations are most cost-effective?
- Which workflow stages catch the most issues?
- Which agent roles are underutilized?
- What recurring failure patterns should become default validation gates?

---

## 9. Autonomous Development Workflow

### 9.1 The Self-Building Portal

The teachings portal itself becomes the first consumer of this platform:

1. **Proposal entry** — Anyone can propose a feature via the ops portal
2. **AI exploration** — Deep research agent investigates feasibility, prior art, implications
3. **Auto-FTR generation** — AI generates a proposed FTR document, runs it through the skill battery (`/compose gaps, crystallize, deep-review, mission-align`)
4. **Implementation plan** — AI produces a concrete implementation plan per FTR
5. **Autonomous build** — Engineer agents implement on a branch derived from dev
6. **CI + AI validation** — Full validation pipeline
7. **Human review** — Staff reviews at experimental URL, leaves comments
8. **Revision loop** — AI agents address feedback, redeploy
9. **Approval gate** — Manual approval required for merge to dev (never automatic)
10. **Decline with record** — Preserved as institutional knowledge

### 9.2 Per-Project Capability

The platform supports multiple projects. Each project gets:

- Its own GitHub repo (auto-created or existing)
- Its own environment chain (dev → prod)
- Its own experiment namespace
- MCP access to shared services (SRF Corpus, design system, platform)
- Access to the shared skill library
- Its own workflow templates (inheriting from org defaults)

**"Create Project" button** on ops dashboard:
1. Enter project name and description
2. Select template (static site, Next.js app, API service)
3. Platform creates: GitHub repo, Neon branch, Vercel project, DNS entries, initial deployment
4. Staff or AI begins building

### 9.3 YSS Independence

YSS gets their own project namespace with:
- YSS-specific design tokens (terracotta/clay palette)
- YSS-specific content (Tamil, Telugu, Kannada sources)
- Shared platform infrastructure (same environment engine, same agent roles)
- Independent workflow templates and approval chains
- Cross-org visibility for the philanthropist/executive stakeholder

---

## 10. Auto-Generated Reference Materials

Agents automatically produce:

| Artifact | Generator | Trigger |
|----------|-----------|---------|
| **API documentation** | Engineer agent | After build stage |
| **Component storybook** | Visual designer agent | After build stage |
| **Architecture diagram** | Architect agent | After design stage |
| **User guide** | Technical writer agent | After validation stage |
| **Video tutorial** | AI voice + screen recording | After deployment (using AI voice/video generation) |
| **Accessibility report** | Accessibility agent | After validation stage |
| **Cost projection** | Operator agent | After deployment |
| **Incident runbook** | Production engineer agent | After deployment |

---

## 11. Protection and Resilience

### 11.1 What Could Go Wrong (Systematically)

| Layer | Risk | Mitigation |
|-------|------|------------|
| **Code** | AI generates insecure code | Security auditor agent in validation; OWASP gates |
| **Code** | AI introduces regressions | Regression agent compares before/after metrics |
| **Operations** | Runaway costs from agent loops | Per-experiment token budgets; circuit breakers |
| **Operations** | Failed deployments | Platform MCP rollback; health checks before DNS swap |
| **Deployment** | Experimental site exposed publicly | Hash domains with no indexing; robots.txt deny |
| **Service** | Agent-generated site has poor performance | Rural 2G tester agent; performance budgets in CI |
| **Service** | Search experience degraded by bad content | Content integrity agent; golden retrieval set regression |
| **Scale** | Too many experiments consuming resources | Experiment TTL (auto-cleanup after 30 days); resource quotas |
| **Content** | AI generates/paraphrases teachings | PRI-01 compliance agent; verbatim fidelity check |
| **Content** | Attribution missing or incorrect | PRI-02 compliance agent; orphaned quote detection |
| **Human** | Staff overwhelmed by agent output volume | Email digest (not per-event); quality threshold for notifications |
| **Institutional** | Decisions made without understanding | Complete audit trail; decision-to-implementation traceability |

### 11.2 Adversarial Exercise Protocol

Before any experiment promotes to dev, adversarial agents exercise problem vectors:

1. **Infrastructure chaos** — What if Neon is down? What if Vercel deploy fails? What if DNS doesn't propagate?
2. **Content integrity** — Are all quotes verbatim? Is attribution complete? Any AI-generated content masquerading as Yogananda's words?
3. **Accessibility attack** — Navigate entire site with keyboard only. Screen reader audit. Color contrast with all themes.
4. **Performance sabotage** — Load test with simulated 2G. Measure TTFB, FCP, LCP on low-end devices.
5. **Security probe** — XSS attempts, SQL injection, dependency vulnerability scan, secret exposure check.
6. **Scope verification** — No new cloud services introduced. Tech stack within approved boundaries. No unauthorized dependencies.

Results compiled into a **leader-ready audit report** with data, not opinions.

---

## 12. Agentic Workflow Designer

### 12.1 Visual Pipeline Builder

On the ops dashboard, a visual DAG editor where staff can:

- Drag stages from a palette (Research, Design, Build, Validate, Deploy, Notify)
- Connect stages with arrows (sequence, fan-out, fan-in)
- Click a stage to configure: assign agent roles, set model, enable/disable, add gates
- Save as reusable workflow template
- Fork existing templates to experiment with variations

### 12.2 Skill Integration

Every agent in the pipeline has access to the shared skill library (43 skills from yogananda-skills). Staff can:

- See which skills each agent role uses by default
- Add/remove skills per agent per stage
- Create custom skills (with AI assistance to design the prompt)
- Skills auto-selected based on stage type (validation stages get `verify`, `review`; research stages get `explore`, `gaps`)

### 12.3 Cost Tracking

The workflow designer shows:
- **Estimated cost** per stage (based on model selection and historical token usage)
- **Running cost** during execution
- **Final cost** with per-agent breakdown
- **Cost comparison** across workflow variants
- All tracked via Bedrock token attribution

---

## 13. Empowerment Vision

### 13.1 Who This Serves

| Audience | What They Can Do |
|----------|-----------------|
| **SRF Staff** | Build event sites, campaigns, internal tools without engineering help |
| **Monastics** | Create teaching aids, meditation resources, retreat materials |
| **YSS Partners** | Build YSS-branded sites with Indian language support |
| **Center Leaders** | Create local center pages, event announcements |
| **IT Department** | Manage the platform, create templates, optimize agent workflows |
| **Executive/Philanthropist** | View cross-org dashboard, approve promotions, track costs |

### 13.2 Getting Started Guide

The concept is new. Help people expand understanding of what's possible:

1. **Example gallery** — Completed experiments with before/after, cost, timeline
2. **Guided tutorials** — "Build your first site in 10 minutes" walkthrough
3. **Template library** — Pre-populated prompts for common SRF needs
4. **Video walkthroughs** — AI-generated video tutorials showing the workflow
5. **Office hours** — IT staff available to help staff craft prompts and review outputs
6. **Experiment sandbox** — Zero-consequence environment for learning

### 13.3 The Complete Workflow (Documented)

```
Ideation
  Staff has an idea → browses template library → selects or writes prompt
  ↓
Research
  Deep research agents survey the field → synthesis report delivered via email
  ↓
Design
  Agent team produces design spec → staff reviews visual concepts
  ↓
Build
  Engineer agents implement → CI + AI validation → deployed to experimental URL
  ↓
Review
  Staff reviews live site → leaves comments via overlay → agents revise and redeploy
  ↓
Approval
  Staff approves → promotes to dev environment → IT reviews for production readiness
  ↓
Launch
  IT promotes dev → production → DNS points to live site
  ↓
Operations
  Production engineer agent monitors → alerts on issues → auto-generates runbooks
```

---

## 14. Technical Architecture Summary

### 14.1 Where This Lives

```
yogananda-platform/                    # Extended with experiment engine
├── packages/mcp-server/               # Add experiment + workflow tools
│   ├── tools/experiment-*.ts          # Experiment lifecycle tools
│   └── tools/workflow-*.ts            # Workflow execution tools
├── packages/agent-orchestrator/       # NEW: Agent execution engine
│   ├── runner.ts                      # DAG executor (stage sequencing)
│   ├── agents/                        # Role definitions with prompts
│   ├── workflows/                     # Workflow template library
│   └── gates/                         # Validation gate definitions
├── packages/email/                    # NEW: Notification service
├── site/src/experiments/              # NEW: Experiment UI on ops dashboard
└── migrations/                        # New tables: experiments, workflow_runs, agent_sessions

yogananda-skills/                      # Shared skill library (unchanged)
├── skills/                            # 43 skills available to all agents
├── agents/                            # 8 agent definitions (extended)
└── config/skill-environments.json     # Per-context skill sets

yogananda-design/                      # Design tokens (unchanged)
└── foundations/ + semantics/ + patterns/  # Available to all agent-built sites
```

### 14.2 Execution Model

- **Agent orchestrator** runs on **AWS Lambda** (or long-running ECS for complex workflows)
- Each agent invocation is a **Claude Code SDK** session with role-specific system prompt + skill set
- Agents communicate via **artifact files in the experiment repo** (not direct messaging)
- State tracked in **platform Neon DB** (experiment table + workflow_run events)
- **MCP tools** expose experiment operations to Claude Code and the dashboard

### 14.3 New MCP Tools (Platform Extension)

```
Experiment Domain:
  experiment_create      — New experiment from prompt + workflow
  experiment_list        — All experiments (filterable by status, project, requester)
  experiment_describe    — Full experiment state with agent outputs
  experiment_promote     — Promote to dev (requires human approval)
  experiment_decline     — Decline with reason (preserved as record)
  experiment_compare     — Side-by-side quality/cost comparison

Workflow Domain:
  workflow_list          — Available workflow templates
  workflow_describe      — Template detail with stages and defaults
  workflow_run           — Execute workflow on experiment
  workflow_status        — Current execution state

Agent Domain:
  agent_role_list        — Available agent roles
  agent_role_describe    — Role detail (prompt, tools, model, cost profile)
  agent_role_create      — New custom role
  agent_session_log      — Transcript of agent session
```

---

## 15. Questions We Should Be Asking

1. **Scope gating:** Should this be internal-only initially, or available to external stakeholders (center leaders, YSS) from the start?
2. **Model access:** What's the budget tolerance for Opus-heavy workflows? Should there be per-staff quotas?
3. **Approval authority:** Who can promote experiments to dev? Just IT? Project leads? Any staff member?
4. **Content boundary:** Can agents build sites that display Yogananda's teachings, or only operational/event sites? (PRI-01 implications)
5. **Open source:** Should the agent orchestrator be open-sourced for other spiritual organizations?
6. **Timeline:** Is this a Phase 4 initiative (after STG-009 corpus complete) or should a minimal version ship earlier?
7. **First experiment:** What should be the inaugural autonomous build? Convocation 2027 is compelling — it's real, time-bounded, and demonstrable.

---

## 16. What We're Not Asking

- How does this change the **role of IT** at SRF? From builders to platform operators and prompt coaches.
- What happens when staff **prefer AI-built sites** to manually built ones? Organizational dynamics.
- How do we handle **quality variance** across experiments? Some staff prompts will produce better results.
- What's the **training investment** to get non-technical staff comfortable? The concept is genuinely new.
- How does this interact with **SRF's existing web properties** (yogananda.org, srfevents.org)?
- What's the **governance model** for the template library? Who curates prompts?
- How do we prevent **experiment sprawl** — hundreds of abandoned experimental sites?

---

---

## 17. Workflow Configuration Format (Greenfield Analysis)

The workflow examples above use YAML. But this is a 2026 greenfield decision — what format best serves an AI-native platform where the primary reader and writer is an AI agent?

### 17.1 Comparison Matrix

| Format | AI Readability | AI Writability | Human Readability | Schema Validation | Comments | Multi-line Strings | Nesting | Ecosystem 2026 |
|--------|---------------|----------------|-------------------|-------------------|----------|-------------------|---------|----------------|
| **YAML** | Good | Risky (indentation errors) | Good | JSON Schema via ajv | `#` comments | `\|` and `>` blocks | Deep, natural | Massive (K8s, GitHub Actions, Docker Compose) |
| **TOML** | Good | Safe (explicit sections) | Excellent for flat | Taplo validator | `#` comments | `"""` triple-quote | Shallow (tables awkward for DAGs) | Growing (Rust, Python pyproject.toml) |
| **JSONC** | Excellent | Excellent (native to LLMs) | Moderate (verbose) | JSON Schema native | `//` and `/* */` | Escaped `\n` (poor) | Deep, explicit | Universal (VS Code, TypeScript) |
| **JSON5** | Excellent | Excellent | Good (trailing commas, comments) | JSON Schema + extensions | `//` and `/* */` | Multi-line strings | Deep, explicit | Moderate (growing in tooling) |
| **Markdown + frontmatter** | Excellent | Excellent | Excellent | Custom parser needed | Native prose | Native | Flat (frontmatter only) | Universal for docs |
| **TypeScript (as config)** | Excellent | Excellent | Good | Native type checking | `//` and `/* */` | Template literals | Deep, typed | Native to stack |
| **KDL** | Good | Good | Excellent (node-based) | kdl-schema | `//` and `/* */` | Raw strings | Deep, semantic | Emerging (designed for config) |
| **CUE** | Good | Moderate | Good | Built-in validation + constraints | `//` | Multi-line | Deep, typed | Growing (Dagger, K8s tooling) |

### 17.2 Analysis by Consumer

**AI agents (primary consumer):**
- JSONC/JSON5 are native — LLMs produce valid JSON more reliably than any other structured format
- YAML indentation is the #1 source of AI-generated config errors
- TypeScript config gives compile-time validation, but requires a runtime

**Human staff (secondary consumer):**
- TOML is the most readable for flat config, but DAG workflows have deep nesting
- Markdown is the most natural for staff who aren't developers
- YAML is familiar from GitHub Actions but error-prone

**Validation:**
- JSONC/JSON5 + Zod (TypeScript) = strongest validation story (native to the stack)
- YAML + JSON Schema works but adds a translation layer
- TypeScript config is self-validating with types
- CUE has the most powerful constraint system but smallest ecosystem

### 17.3 Recommendation: Dual-Layer Format

**Machine layer: JSONC** — Stored, validated, executed. AI agents read and write JSONC natively. Zod schemas validate at parse time. VS Code provides intellisense. The platform already uses JSON for project configs (`config/projects/teachings.json`).

**Human layer: Markdown with structured sections** — Staff interact via a form UI on the ops dashboard. The form produces JSONC. For power users who want to edit config directly, JSONC with rich comments.

**Why not YAML:** In an AI-native platform (PRI-12), the primary config author is an AI agent. YAML's indentation sensitivity is the single largest source of AI-generated config errors. JSONC eliminates this class of bugs entirely while preserving comments and readability.

**Why not TypeScript:** Tempting (native to the stack, type-safe), but config should be data, not code. TypeScript config requires a runtime to evaluate, can't be safely edited by non-developer staff, and introduces execution risk in a platform that runs untrusted workflows.

**Revised workflow config example (JSONC):**

```jsonc
// Convocation 2027 Website — Full Autonomous Build
{
  "name": "Convocation 2027 Website",
  "template": "full-autonomous-build",
  "prompt": "Build the SRF Yearly Convocation 2027 website...",

  "stages": {
    "research": {
      "enabled": true,
      "agents": ["deep-researcher"],
      "config": {
        "platforms": ["claude", "gemini"],
        "topics": [
          "SRF convocation history",
          "event website best practices",
          "spiritual conference accessibility"
        ]
      }
    },

    "design": {
      "enabled": true,
      "agents": ["product-designer", "visual-designer", "architect"],
      "fan": "parallel",
      "config": {
        "design_system": "yogananda-design",
        "brand": "srf"
      }
    },

    // Mediator synthesizes parallel design outputs
    "mediate": {
      "enabled": true,
      "agents": ["design-mediator"],
      "fan": "merge"
    },

    "build": {
      "enabled": true,
      "agents": ["engineer"],
      "config": {
        "substrate": "claude-code",
        "model": "sonnet",
        "skills": ["implement", "verify", "scope"]
      }
    },

    "validate": {
      "enabled": true,
      "agents": [
        "qa-agent",
        "accessibility-agent",
        "compliance-agent",
        "architecture-agent",
        "production-engineer",  // Instrumentation, telemetry, failure scenarios
        "low-bandwidth-tester", // Simulated 2G/3G device testing
        "dba-agent"             // Schema review, query plans, index analysis
      ],
      "fan": "parallel",
      "gates": [
        "tests_pass",
        "axe_core_zero_violations",
        "no_new_cloud_services",
        "design_system_compliance",
        "principles_alignment",
        "bundle_size_budget",
        "lighthouse_scores",
        "sentry_integration_verified",
        "new_relic_instrumented"
      ]
    },

    "deploy": {
      "enabled": true,
      "config": {
        "branch_from": "dev",
        "domain": "auto"
      }
    },

    "notify": {
      "enabled": true,
      "config": {
        "channels": ["email"],  // Future: ["email", "teams", "sms"]
        "recipients": ["requester"],
        "include": ["live_url", "research_summary", "cost_report"]
      }
    }
  },

  "models": {
    "default": "sonnet",
    "review": "opus",
    "research": "opus"
  }
}
```

---

## 18. Expanded Agent Roles

### 18.1 Full Agent Registry (30+ roles)

Building on Section 3, here is the complete role taxonomy organized by workflow phase:

**Research Phase:**

| Role | Focus | Model | Perspective |
|------|-------|-------|-------------|
| **Deep Researcher** | Survey fields, find gaps, synthesize dual-platform findings | Opus | Breadth — what exists in this space? |
| **Domain Expert** | Deep knowledge in specific area (SRF history, event logistics, accessibility standards) | Opus | Depth — what does excellence look like here? |
| **Competitive Analyst** | Survey similar sites/products, identify best practices and anti-patterns | Sonnet | Comparison — what do others do well/poorly? |
| **Seeker Persona** | Inhabit specific seeker perspectives (new visitor, long-time devotee, non-English speaker, rural India) | Opus | Empathy — what does this feel like to use? |

**Design Phase:**

| Role | Focus | Model | Perspective |
|------|-------|-------|-------------|
| **Product Designer** | User stories, information architecture, interaction flows | Opus | Structure — how does this work? |
| **Visual Designer** | Typography, color, layout, component design, design system compliance | Opus | Aesthetics — does this honor the content? |
| **Architect** | System design, data model, API contracts, technology selection | Opus | Engineering — how do we build this right? |
| **Content Strategist** | Information hierarchy, copy tone, content modeling | Opus | Communication — what do people need to know? |
| **Design Mediator** | Resolve conflicts between parallel design outputs | Opus | Synthesis — what's the unified vision? |
| **Accessibility Designer** | Inclusive design from first principles (not retrofit) | Opus | Inclusion — does this work for everyone? |

**Build Phase:**

| Role | Focus | Model | Perspective |
|------|-------|-------|-------------|
| **Frontend Engineer** | React/Next.js components, CSS, client-side logic | Sonnet | UI — does this render correctly? |
| **Backend Engineer** | API routes, database queries, server logic | Sonnet | Data — does this process correctly? |
| **Full-Stack Engineer** | End-to-end implementation (default for simpler projects) | Sonnet | Integration — does this work together? |
| **DevOps Engineer** | CI/CD, deployment config, infrastructure as code | Sonnet | Pipeline — does this deploy correctly? |
| **Test Engineer** | Test generation, coverage analysis, edge case identification | Sonnet | Correctness — does this fail gracefully? |

**Validation Phase:**

| Role | Focus | Model | Perspective |
|------|-------|-------|-------------|
| **QA Agent** | Functional testing, regression detection, edge cases | Sonnet | Bugs — what breaks? |
| **Accessibility Auditor** | WCAG 2.1 AA compliance, screen reader, keyboard nav | Sonnet | Barriers — what excludes? |
| **Compliance Agent** | PRI alignment, tech stack limits, no new cloud services | Haiku | Rules — what violates policy? |
| **Architecture Reviewer** | Pattern consistency, dependency hygiene, scope creep | Sonnet | Coherence — does this fit? |
| **Principles Validator** | Every output checked against PRI-01–12 | Opus | Mission — does this honor the teachings? |
| **Production Engineer** | Instrumentation, telemetry, tracing, logging, failure scenarios | Sonnet | Observability — can we see what's happening? |
| **Database Administrator** | Schema design, query plans, indexes, vacuum, monitoring integration | Sonnet | Data health — is the database well-designed? |
| **Low-Bandwidth Tester** | Performance on constrained devices (2G/3G, low-end phones, rural networks) | Sonnet | Equity — does this work in Bihar? |
| **Security Auditor** | OWASP top 10, dependency vulnerabilities, secret exposure | Sonnet | Safety — what can be exploited? |
| **Regression Detector** | Before/after metrics comparison (bundle size, Lighthouse, test count) | Haiku | Trajectory — are we getting worse? |

**Adversarial Phase (pre-promotion stress test):**

| Role | Focus | Model | Perspective |
|------|-------|-------|-------------|
| **Chaos Engineer** | Infrastructure failure injection, service degradation simulation | Sonnet | Resilience — what survives failure? |
| **Performance Saboteur** | JS bloat, unoptimized images, N+1 queries, memory leaks | Sonnet | Load — what breaks at scale? |
| **Content Integrity Auditor** | Orphaned quotes, paraphrase detection, attribution completeness | Opus | Fidelity — is every word Yogananda's? |
| **Scope Creep Detector** | Unauthorized dependencies, feature overreach, cloud service additions | Haiku | Discipline — did we build only what was asked? |

**Operations Phase (post-deployment):**

| Role | Focus | Model | Perspective |
|------|-------|-------|-------------|
| **Site Reliability Agent** | Uptime monitoring, alerting, auto-remediation suggestions | Sonnet | Health — is this running well? |
| **Cost Analyst** | Token usage analysis, infrastructure cost projection, optimization suggestions | Haiku | Efficiency — are we spending wisely? |
| **Stakeholder Communicator** | Non-technical summaries, decision points, progress updates | Sonnet | Translation — can leaders understand this? |
| **Executive Reviewer** | High-level quality, mission alignment, strategic fit | Opus | Judgment — should we ship this? |

### 18.2 Production Engineer Deep Dive

The Production Engineer agent deserves special attention — it sees the **latency layers** across the entire stack:

**What it instruments:**
```
Request lifecycle (what the Production Engineer sees):
  DNS resolution           →  Route 53 health
  TLS handshake            →  ACM certificate validity
  Edge CDN                 →  Vercel edge cache hit/miss
  Server-side rendering    →  Next.js SSR timing, React Server Component waterfall
  Database queries         →  Neon connection pool, query latency, pg_stat_statements
  External API calls       →  Voyage AI embedding latency, Bedrock inference latency
  Client hydration         →  JS bundle parse time, hydration duration
  User interaction         →  Input latency, search responsiveness
```

**What it asks:**
- Is every component instrumented with Sentry error boundaries?
- Are New Relic custom attributes set on every transaction?
- Do we have structured logs with request ID correlation at every boundary?
- What are the failure scenarios for each external dependency?
- What happens when Neon is slow? When Voyage AI times out? When Bedrock throttles?
- Are there circuit breakers? Graceful degradation? Fallback behaviors?
- Can an operator diagnose a production issue from logs alone, without reproducing it?

**Sentry integration checks:**
- Error boundaries on every page and component
- Breadcrumbs for user navigation
- Performance transactions with custom spans
- Release health tracking
- Source maps uploaded

**New Relic integration checks:**
- Browser agent installed with SPA monitoring
- Custom attributes (user segment, language, device tier)
- Distributed tracing across API boundaries
- Alert policies for SLO violations
- Deployment markers for change correlation

### 18.3 Database Administrator Deep Dive

The DBA agent operates with deep PostgreSQL expertise:

**Schema review:**
- Index coverage for all query patterns (EXPLAIN ANALYZE verification)
- Foreign key constraints and cascade behavior
- Column types optimized (e.g., `uuid` vs `text`, `jsonb` vs `json`)
- Partition strategy for large tables

**Runtime health:**
- `pg_stat_user_tables`: sequential scan ratios, dead tuple counts
- Autovacuum configuration and lag
- Connection pool sizing (Neon-specific: serverless scaling behavior)
- Query plan regression detection via `pg_stat_statements`

**Maintenance protocol:**
- VACUUM ANALYZE scheduling recommendations
- Index bloat detection and REINDEX strategy
- Statistics target tuning for complex queries
- Dead tuple accumulation trending

**Monitoring integration:**
- Neon dashboard metrics exposed via API
- pg_stat_statements query digest → New Relic custom events
- Slow query alerts (> P95 threshold)
- Connection count alerts (approaching Neon tier limits)

### 18.4 Low-Bandwidth Tester Deep Dive

This agent embodies PRI-05 (Global-First) as a validation practice:

**Device tiers tested:**

| Tier | Device | Network | Target |
|------|--------|---------|--------|
| **Tier 1** | iPhone 15 / Pixel 8 | 4G/WiFi | Baseline (must be excellent) |
| **Tier 2** | Samsung Galaxy A14 | 3G | 70% of Hindi/Spanish audience |
| **Tier 3** | Nokia 2.4 / JioPhone | 2G (50kbps) | Rural India, minimum viable |
| **Tier 4** | Feature phone browser | GPRS | Aspirational (text-only fallback) |

**What it measures:**
- Total JS bundle size (must be < 100KB per FTR-003)
- First Contentful Paint on each tier (< 1.5s on Tier 1, < 4s on Tier 3)
- Time to Interactive on each tier
- Data transferred per page load (budget: < 500KB on first load)
- Functionality with JavaScript disabled (progressive enhancement)
- Image optimization (WebP, lazy loading, responsive srcset)
- Font loading strategy (system fonts as fallback, font-display: swap)

**How it tests:**
- Playwright with network throttling profiles per tier
- Lighthouse CI with mobile preset
- Bundle analysis (webpack-bundle-analyzer or equivalent)
- HTTP Archive format export for detailed waterfall analysis

---

## 19. Notification Architecture

### 19.1 Multi-Channel Notifications

Start with email; design for expansion.

| Channel | Priority | Integration | Use Case |
|---------|----------|-------------|----------|
| **Email** | P0 (launch) | AWS SES or Resend | Primary notification for all experiment state transitions |
| **MS Teams** | P1 (near-term) | Teams Incoming Webhook or Graph API | IT team collaboration, real-time build status |
| **SMS** | P2 (future) | AWS SNS or Twilio | Critical alerts (production down, budget exceeded), opt-in |
| **Ops Dashboard** | P0 (launch) | WebSocket or SSE | Real-time status on yogananda.tech/ops |
| **Slack** | P3 (if needed) | Slack Webhook API | If any teams use Slack |

### 19.2 Notification Content Design

Each notification is **calm** (PRI-08 — no urgency theater) and **actionable**:

```
Subject: Convocation 2027 site — Build complete, ready for review

Your experiment is deployed and ready for review.

  Live URL: https://abc123.experiments.yogananda.tech
  Status: Deployed (awaiting your review)
  Cost so far: $3.47 (1.2M tokens across 8 agents)
  Time elapsed: 12 minutes

  Research summary: [2-sentence synthesis]
  Build summary: 14 components, 23 tests passing, 0 accessibility violations

  Next step: Visit the live URL and use the review overlay to leave feedback.
  Or: Click "Approve" to promote to dev environment.

  Full experiment details: https://yogananda.tech/ops/experiments/abc123
```

### 19.3 Notification Rules

- **Digest mode** by default (one email per state transition, not per agent action)
- Staff can opt into **verbose mode** (notification per agent completion)
- **Quiet hours** respected (batch notifications, deliver at start of business)
- **Threshold notifications** — only notify if cost exceeds budget, or if validation fails
- Teams/SMS reserved for **critical events** (not routine state transitions)

---

## 20. Cost Tracking Architecture (Glass Box)

### 20.1 Granular Token Tracking

Every AI operation records:

```jsonc
{
  "experiment_id": "exp_abc123",
  "stage": "build",
  "agent_role": "frontend-engineer",
  "model": "claude-sonnet-4-6",
  "provider": "aws-bedrock",
  "operation": "implement-component",
  "input_tokens": 45230,
  "output_tokens": 12840,
  "cost_usd": 0.0847,
  "duration_ms": 18500,
  "timestamp": "2026-04-15T14:32:00Z",
  "project": "convocation-2027",
  "requester": "staff@srf.org"
}
```

### 20.2 Cost Questions the Platform Answers

**Per-experiment:**
- "How much did this experiment cost in tokens?" → `$3.47 (1.2M tokens)`
- "Which agent was most expensive?" → `Deep Researcher: $1.82 (Opus, 400K tokens)`
- "What would this cost with all-Sonnet?" → `$1.23 (estimated from token counts)`

**Per-project (aggregate):**
- "How much did all experiments cost this month?" → `$127.40 across 18 experiments`
- "What's the average experiment cost?" → `$7.08 (median: $4.20)`
- "Which workflow template is most cost-effective?" → `Proof of Concept: $2.10 avg`

**Cross-organization:**
- "Where is our granular and aggregate spend across all IT services?"

```
Monthly IT AI Spend — March 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AWS Bedrock (Claude)              $234.50
    ├── Teachings portal enrichment   $89.20
    ├── Agent experiments              $127.40
    └── Platform AI auto-adjust        $17.90

  Voyage AI (embeddings)             $12.30
    └── Teachings portal embeddings    $12.30

  Neon PostgreSQL                    $19.00
    ├── Teachings portal (Scale)       $19.00
    └── Platform (Free tier)            $0.00

  Vercel                             $20.00
    ├── Teachings portal (Pro)         $20.00
    └── Platform (Pro)                  $0.00

  Contentful                          $0.00
    └── Community tier                  $0.00

  Total                             $285.80
  Budget                            $500.00
  Remaining                         $214.20  (57% utilized)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 20.3 Cost Controls

| Control | Mechanism |
|---------|-----------|
| **Per-experiment budget** | Token budget set at experiment creation; circuit breaker stops agents if exceeded |
| **Per-project monthly budget** | Configurable in project config; alerts at 80%, hard stop at 100% |
| **Organization monthly budget** | Platform-level budget across all projects; executive notification at threshold |
| **Model cost optimizer** | After experiment completes, estimate cost with alternative model mix; suggest cheaper options that meet quality bar |
| **Cost-per-quality ratio** | Track $/quality-point across experiments; surface the efficient frontier |

### 20.4 Integration with Existing Platform Cost Tracking

The platform already has `cost_snapshots` table and `get_costs`, `get_cost_breakdown`, `sync_costs`, `budget_check` MCP tools. Extend these:

- Add `experiment_id` dimension to cost_snapshots
- Add `agent_role` and `model` dimensions
- `budget_check` accepts experiment scope (not just project scope)
- New `cost_forecast` tool: given a workflow template and model selection, estimate cost before running

---

## 21. Glass Box Operations

### 21.1 The Glass Box Principle

Every operation in the platform is **visible, explainable, and auditable** — not just logged, but designed for learning. The platform is a **glass box**, not a black box.

**Four audiences for the glass box:**

| Audience | What They See | Why |
|----------|---------------|-----|
| **Human oversight** | Decision trail, approval queues, cost summaries | Accountability — humans approve, AI proposes |
| **Learning** | Experiment archive, prompt effectiveness data, quality trends | Improvement — each experiment makes the next one better |
| **Cost awareness** | Real-time spend, budget utilization, cost-per-quality metrics | Stewardship — responsible use of philanthropic funding |
| **AI continual learning** | Session transcripts, validation results, human feedback | Evolution — agents improve from experience |

### 21.2 Glass Box Surfaces

**Live Operations Dashboard (`yogananda.tech/ops`):**
```
┌─────────────────────────────────────────────────────────┐
│  Active Experiments                                      │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Convocation 2027  ■■■■■■■■□□  Build (78%)  $2.41   │ │
│  │ Retreat Landing    ■■■■■■■■■■  Complete     $4.12   │ │
│  │ Center Directory   ■■■□□□□□□□  Design (30%) $0.87   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  This Month                                              │
│  Experiments: 18  │  Total Cost: $127.40  │  Budget: 25% │
│  Approved: 12     │  Declined: 3          │  Active: 3    │
│                                                          │
│  Agent Performance                                       │
│  Best prompt pattern: Detailed user stories (8.4/10 avg) │
│  Most cost-effective: Proof of Concept template ($2.10)  │
│  Quality trend: ↑ 0.3 points over last 10 experiments    │
└─────────────────────────────────────────────────────────┘
```

**Experiment Detail View:**
- **Timeline** — Visual progression through stages with timestamps and costs
- **Agent sessions** — Expandable transcripts of each agent's work (what it read, what it decided, what it produced)
- **Decision log** — Every significant choice the agents made, with rationale
- **Validation results** — Gate-by-gate pass/fail with detailed findings
- **Human feedback** — Review overlay comments and how agents addressed them
- **Cost waterfall** — Token spend by agent, by model, by stage

**Institutional Learning Feed:**
- Weekly digest: "This week's experiments taught us..."
- Pattern detection: "Experiments with deep research phase produce 23% higher quality scores"
- Anti-pattern alerts: "3 experiments this month exceeded budget due to Opus in build phase"
- Role effectiveness: "Production Engineer agent caught 7 instrumentation gaps across 5 experiments"

### 21.3 AI Self-Improvement Loop

```
                    ┌──────────────┐
                    │  Experiment   │
                    │  completes    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Opus rates   │
                    │ quality      │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼───────┐ ┌──▼──────────┐
       │ Prompt       │ │ Workflow  │ │ Role        │
       │ effectiveness│ │ efficiency│ │ contribution│
       │ analysis     │ │ analysis  │ │ analysis    │
       └──────┬──────┘ └──┬───────┘ └──┬──────────┘
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────▼───────┐
                    │ Insights fed │
                    │ back into    │
                    │ defaults     │
                    └──────────────┘

Examples:
- "Prompts with specific acceptance criteria score 1.2 points higher"
  → Update template library to include acceptance criteria by default
- "QA agent catches 40% more issues when run after accessibility agent"
  → Reorder default validation pipeline
- "Opus in build phase costs 4x more but only improves quality 0.3 points"
  → Default to Sonnet for build, flag Opus as premium option
```

---

## 22. Deep Research Prompts

### 22.1 Prompt Design Philosophy

These prompts are designed following the empirically validated pattern from this project: **Claude Opus designs the research prompts**, which are then submitted to both Claude Deep Research and Gemini Deep Research. The prompts are:

- **Specific** — not "research AI agents" but precise topic decomposition
- **Multi-dimensional** — each prompt covers 8-12 sub-topics for comprehensive coverage
- **Gap-seeking** — explicitly ask for what's missing, not just what exists
- **Comparative** — ask for tradeoffs and tensions, not just descriptions
- **Grounded** — reference specific technologies, standards, and constraints

### 22.2 Prompt 1: Autonomous AI Agent Orchestration for Organizational Software Delivery

**Submit to both Claude Deep Research and Gemini Deep Research.**

```
RESEARCH REQUEST: Autonomous AI Agent Orchestration for Organizational Software Delivery

CONTEXT: A philanthropically-funded religious non-profit (Self-Realization Fellowship,
founded 1920) is building an AI agent platform that empowers non-technical staff to
create digital applications autonomously. The platform uses Claude Code (Anthropic's
CLI agent) as the execution substrate, with multiple specialized AI agents orchestrated
in DAG workflows. The organization has an existing platform with environment lifecycle
management (branch = environment), MCP server (27 tools), review overlay, and cost
tracking. The primary consumers are monastics and administrative staff, not software
engineers. The platform must work for both SRF (US-based) and YSS (India-based,
Yogoda Satsanga Society) organizations sharing infrastructure.

Conduct a comprehensive survey across the following 12 topics. For each topic, cite
specific implementations, academic papers, or production systems. Identify gaps in
current knowledge and tensions between approaches.

TOPIC 1: Multi-Agent Orchestration Frameworks (2024-2026)
Survey the current landscape of multi-agent orchestration frameworks. Include:
- CrewAI, AutoGen, LangGraph, Semantic Kernel, OpenAI Swarm, Anthropic Claude Agent SDK
- Agent-to-agent communication patterns: message passing vs. shared artifacts vs. blackboard
- DAG execution engines for agent workflows (comparison with CI/CD pipeline engines like
  Dagger, Tekton, Argo Workflows adapted for AI agents)
- Fan-out/fan-in patterns for parallel agent execution with merge/mediation
- State management across multi-step agent workflows
- Error recovery and retry strategies specific to LLM agents (non-deterministic outputs)
- Which frameworks support heterogeneous model selection per agent?
- Production deployments at organizational scale (not just demos)

TOPIC 2: Agent Role Specialization vs. Generalist Agents
Research the tradeoff between many narrow specialist agents vs. fewer broad generalist agents:
- Evidence for/against role specialization in multi-agent systems
- The "committee of experts" pattern vs. "single genius" pattern in LLM applications
- How does agent count affect coherence of final output?
- Role-based prompt engineering: how much does a system prompt shape agent behavior?
- The mediator/synthesizer pattern for resolving conflicts between specialist outputs
- Cost implications: many Haiku agents vs. one Opus agent for equivalent tasks
- Real-world evidence: do specialized agents produce better code than generalist agents?

TOPIC 3: AI-Powered CI/CD — Agents as Validation Gates
Survey the emerging practice of using AI agents as CI pipeline stages:
- AI code review agents in production (CodeRabbit, Cursor, Copilot reviews, etc.)
- AI accessibility testing beyond rule-based tools (understanding semantic meaning)
- AI architecture compliance checking (detecting pattern violations, scope creep)
- AI security auditing (beyond SAST — understanding application-level vulnerabilities)
- AI performance budget enforcement (understanding bundle impact of changes)
- How to make AI validation deterministic enough for CI gates (non-determinism problem)
- False positive rates in AI-based CI gates — what's the practical threshold?
- Comparison: AI gates vs. traditional linting/testing — complementary or replacement?

TOPIC 4: Non-Technical User Interfaces for AI Agent Orchestration
Research how non-technical users interact with AI agent systems:
- Prompt template libraries: design patterns for pre-populated, editable prompts
- Visual workflow builders for AI agent pipelines (any exist beyond ML pipeline tools?)
- The "natural language specification" pattern — staff describes what they want in prose
- How do non-engineers evaluate AI-generated code/sites? Review overlay patterns
- Progressive disclosure: simple interface for basic use, power features for advanced users
- Onboarding patterns for radically new capabilities (staff who've never used AI)
- The "experiment sandbox" pattern — zero-consequence learning environments
- Accessibility of AI orchestration interfaces themselves (screen readers, keyboard nav)

TOPIC 5: Cost Attribution and Optimization for Multi-Agent AI Systems
Research granular cost tracking and optimization for AI token spend:
- Token-level attribution across multi-agent workflows (who spent what, on which model)
- Cost forecasting: predicting experiment cost before execution
- The cost-quality frontier: empirical data on model quality vs. cost for code generation
- Budget controls and circuit breakers for runaway AI agents
- Cost comparison across providers (Anthropic/Bedrock, OpenAI, Google, open-source)
- Organizational AI spend dashboards: what do leaders need to see?
- The "cheapest effective model" optimization: systematically finding the least expensive
  model that meets quality thresholds for each task type
- AWS Bedrock token tracking vs. direct API token tracking: granularity differences

TOPIC 6: Institutional Memory and Audit Trails for AI-Generated Systems
Research how organizations maintain institutional knowledge when AI generates systems:
- Decision traceability: linking code to the prompt/research/design that produced it
- The "glass box" pattern: making AI operations visible and explainable
- Audit requirements for AI-generated code in regulated or mission-critical environments
- Knowledge base construction from experiment archives (what worked, what didn't)
- The AI self-improvement loop: using past experiment data to improve future prompts
- Version control for AI prompts and agent role definitions
- Legal and governance implications of AI-generated code (copyright, liability)
- How to maintain human understanding when AI generates the system?

TOPIC 7: Deep Research as a Software Development Phase
Research the practice of using AI deep research (Claude, Gemini, Perplexity) as a
formal phase in software development:
- Dual-platform research synthesis: patterns for combining Claude and Gemini deep research
- Research prompt engineering: designing prompts that produce actionable development insights
- The research-to-specification pipeline: translating research findings into design specs
- Quality assessment of AI deep research outputs (accuracy, completeness, citation quality)
- Research archival: preserving research as institutional knowledge
- Gap analysis: using research to identify what we don't know before we build
- Cost-effectiveness of research phase: does it reduce downstream rework?

TOPIC 8: Autonomous Code Generation Quality and Safety
Research the current state of autonomous code generation quality:
- Code quality metrics for AI-generated code vs. human code (bug rates, maintainability)
- Safety boundaries: what should AI agents never do autonomously?
- The human approval gate: patterns for efficient human review of AI-generated systems
- Adversarial testing of AI-generated code (deliberate attack on AI outputs)
- Regression detection in autonomous build-test-deploy cycles
- The "AI generates, human approves, AI deploys" pattern in production
- How much context does an AI agent need to generate production-quality code?
- Style consistency: maintaining codebase conventions across multiple AI agent sessions

TOPIC 9: Notification and Communication Patterns for AI Agent Systems
Research how AI agent platforms communicate with human stakeholders:
- Email notification design for AI workflow state transitions
- MS Teams / Slack integration patterns for AI agent updates
- SMS alerting for critical AI agent events
- The "digest vs. real-time" tradeoff in AI agent notifications
- Calm notification design: avoiding alert fatigue from autonomous systems
- Progress visualization for multi-stage AI workflows
- The "AI summary" pattern: AI-generated plain-language status updates

TOPIC 10: Configuration Formats for AI-Native Platforms (2026)
Research optimal configuration formats when the primary reader/writer is an AI agent:
- YAML vs. JSONC vs. TOML vs. TypeScript-as-config vs. KDL vs. CUE
- AI generation accuracy by format (which format do LLMs produce most reliably?)
- Validation story per format (JSON Schema, Zod, CUE constraints, TOML validators)
- The "dual layer" pattern: machine format for storage, human format for editing
- Schema evolution and backwards compatibility across format options
- Comment support, multi-line strings, and nesting capability comparison
- Ecosystem maturity and tooling in 2026

TOPIC 11: Multi-Organization AI Agent Platforms
Research patterns for shared AI platforms serving multiple organizations:
- Multi-tenant AI agent orchestration (shared infrastructure, isolated data)
- Organization-specific agent roles and workflow templates
- Cross-organization visibility for shared stakeholders (executive/philanthropist view)
- Shared vs. organization-specific design systems in agent-generated outputs
- Cost allocation across organizations sharing AI infrastructure
- Governance models: who controls the shared platform?

TOPIC 12: The Emerging "AI IT Department" Pattern
Research the organizational transformation when AI agents handle software delivery:
- How does the IT role change from builder to platform operator and prompt coach?
- Training non-technical staff to work with AI agent platforms
- Quality variance: handling different prompt quality from different staff members
- The "experiment sprawl" problem: too many AI-generated sites/features
- Governance models for AI agent template libraries
- Cultural adoption patterns for radically new capabilities
- Risk management for AI-dependent IT operations
- What happens when AI-generated systems need maintenance but no human understands them?

SYNTHESIS REQUEST:
After surveying all 12 topics, provide:
1. The 5 most important findings that would change architectural decisions
2. The 3 biggest gaps in current knowledge (what nobody has solved yet)
3. The 2 highest-risk assumptions in the described platform vision
4. Specific technology recommendations with justification
5. What questions should we be asking that this survey didn't cover?
```

### 22.3 Prompt 2: Sacred Organization Digital Empowerment — AI Agents in Service of Spiritual Mission

**Submit to both Claude Deep Research and Gemini Deep Research.**

```
RESEARCH REQUEST: AI Agent Platforms for Religious and Spiritual Organizations —
Digital Empowerment Without Compromise

CONTEXT: Self-Realization Fellowship (SRF, founded 1920 by Paramahansa Yogananda)
and Yogoda Satsanga Society of India (YSS, founded 1917) are building an AI agent
platform to empower staff, monastics, and volunteers to create digital applications.
The organizations serve millions globally, operate in 9+ languages, and maintain
strict theological commitments: verbatim fidelity to published teachings (no AI
paraphrase), no behavioral tracking, no engagement manipulation, accessibility as
spiritual practice (serving rural India on 2G equally with Los Angeles on fiber).
The platform is philanthropically funded with a 10-year design horizon.

This research explores the intersection of autonomous AI systems and sacred mission
organizations — a space with almost no prior art. Survey the following 8 topics.

TOPIC 1: AI Agent Systems in Religious and Non-Profit Organizations
Survey any existing deployments of AI agents in religious, spiritual, or mission-driven
organizations:
- Do any religious organizations use multi-agent AI systems for software delivery?
- The Catholic Church, megachurch networks, Buddhist organizations, Islamic institutions —
  any AI agent adoption beyond chatbots?
- Non-profit digital transformation patterns that apply to religious organizations
- The unique constraints: content fidelity, theological review gates, no behavioral tracking
- How do organizations with content authority (authoritative texts, approved translations)
  use AI without compromising authority?
- The "AI as librarian, not oracle" pattern — finding vs. generating content

TOPIC 2: Empowering Non-Technical Spiritual Communities with AI
Research patterns for putting AI tools in the hands of non-technical spiritual workers:
- Monastic communities and technology: historical patterns of adoption/resistance
- Training contemplative communities on AI capabilities without creating dependency
- The "prompt coaching" role: helping non-engineers express needs to AI systems
- Accessibility in the deepest sense: not just WCAG compliance but cognitive accessibility
  for people whose primary expertise is meditation, not technology
- User story patterns that work for spiritual organizations (seeker journeys, devotional
  flows, service to community)
- How to evaluate AI output quality when the evaluator is a monastic, not an engineer?

TOPIC 3: Content Fidelity Constraints in AI-Generated Systems
Research how organizations with authoritative content handle AI generation:
- Legal publishers, medical institutions, religious organizations: how do they ensure
  AI doesn't paraphrase or distort authoritative content?
- AI-generated sites that must display copyrighted/sacred text verbatim
- Automated detection of paraphrase, summarization, or AI-generated content
  masquerading as original text
- Attribution chain verification: every quote traces to source, page, chapter
- The distinction between AI-generated UI/code and AI-generated content
  (the former is acceptable, the latter is prohibited)

TOPIC 4: Calm Technology Principles in Autonomous AI Systems
Research the intersection of calm technology and AI agent platforms:
- Mark Weiser and John Seely Brown's calm technology principles applied to AI notifications
- How to prevent AI agent systems from becoming attention-demanding
- The anti-pattern: AI systems that create urgency, send excessive alerts, demand engagement
- Notification design that respects contemplative practice schedules
- The "technology waits, it does not interrupt" principle in autonomous systems
- Ambient awareness vs. active notification for AI workflow status

TOPIC 5: Global Equity in AI-Powered Digital Platforms
Research how AI platforms can serve low-resource populations equitably:
- AI-generated sites that work on 2G connections and low-end phones
- Performance budgets as equity commitments (not just engineering constraints)
- Multi-language support in AI-generated applications (9+ languages, multiple scripts)
- The rural India/Bihar test: can an AI-generated site serve a seeker on a JioPhone?
- Progressive enhancement as a spiritual practice: HTML is the foundation
- AI agent testing on constrained devices: simulated vs. real device testing

TOPIC 6: Privacy-Preserving AI Agent Platforms
Research how to build AI agent platforms that respect deep privacy commitments:
- DELTA compliance (no user identification, no session tracking, no behavioral profiling)
  in AI agent generated applications
- AI agents that build analytics without surveillance
- Content-based (not behavior-based) recommendation in AI-generated systems
- How to track AI platform usage (for cost and improvement) without tracking users
- The distinction: track what AI agents do (for audit), never track what users do

TOPIC 7: 10-Year Architecture for AI Agent Platforms
Research architectural patterns that survive a decade of AI model evolution:
- How to build an agent platform that works with Claude today and whatever exists in 2036
- Abstraction layers between orchestration and model providers
- The "model as parameter" pattern: same workflow, different model, comparable output
- Standard protocols for agent communication that outlast vendor SDKs
- Database-centric vs. API-centric vs. event-centric orchestration architecture
- What components of 2026 AI agent platforms will look obsolete by 2030?

TOPIC 8: Autonomous AI Systems and Human Oversight for Sacred Content
Research governance patterns for AI systems operating on sacred content:
- The human review gate: when must a human approve, and when can AI proceed?
- Trust levels for AI agents: read-only, propose-to-queue, direct action
- The "AI proposes, human approves" pattern at organizational scale
- How to prevent AI drift from mission over time (gradual erosion of constraints)
- Institutional memory: how do AI systems remember why decisions were made?
- The audit trail as spiritual practice: transparency as service

SYNTHESIS REQUEST:
After surveying all 8 topics, provide:
1. The most surprising finding — something that challenges conventional assumptions
2. The most relevant precedent — even if imperfect, what's closest to this vision?
3. The biggest uncharted territory — what has genuinely never been attempted?
4. 3 specific risks unique to spiritual organizations using autonomous AI
5. 3 specific opportunities unique to spiritual organizations using autonomous AI
6. What would a "world-class" version of this platform look like in 2030?
7. What questions emerge from this research that the original vision didn't consider?
```

### 22.4 Research Execution Plan

1. **Opus designs the prompts** (above — done)
2. **Submit Prompt 1** to both Claude Deep Research and Gemini Deep Research
3. **Submit Prompt 2** to both Claude Deep Research and Gemini Deep Research
4. **Receive 4 reports** (Claude-1, Gemini-1, Claude-2, Gemini-2)
5. **Opus synthesis agent** reads all 4 reports, produces:
   - `synthesis-agent-orchestration.md` — Convergences, divergences, gaps from Prompt 1
   - `synthesis-sacred-empowerment.md` — Convergences, divergences, gaps from Prompt 2
   - `synthesis-architectural-implications.md` — Combined findings that change the vision
6. **Update this vision document** with research-informed refinements

---

## 23. Observability by Design — Sentry and New Relic per Application

### 23.1 The Problem

Every agent-built application needs production observability from the first deployment. Today, adding Sentry and New Relic is a manual, expert process. In an autonomous agent platform, observability must be **designed into the build stage**, not retrofitted.

### 23.2 Observability as Build-Stage Responsibility

The **Engineer agent** (or a specialized **Instrumentation Agent**) adds observability during the build stage, not as an afterthought validation:

```
Build Stage
├── Scaffold (project structure, dependencies)
├── Implement (components, pages, API routes)
├── Instrument (Sentry + New Relic integration)  ← Built in, not bolted on
├── Test (unit, integration, e2e)
└── Style (design system compliance)
```

### 23.3 Sentry Integration Pattern (Per Application)

Every agent-built application receives:

**A. Error Tracking (automatic):**
```typescript
// Instrumentation agent adds to every Next.js app:
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: 0.1,        // 10% of transactions
  replaysSessionSampleRate: 0,  // No session replay (DELTA compliance)
  replaysOnErrorSampleRate: 0,  // No session replay (DELTA compliance)
});
```

**B. Error Boundaries (every page/component):**
```tsx
// Instrumentation agent wraps every page:
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <PageContent />
</Sentry.ErrorBoundary>
```

**C. Performance Monitoring:**
- Automatic transaction traces for every API route
- Custom spans for database queries, external API calls
- Web Vitals collection (FCP, LCP, CLS, INP)
- Source maps uploaded at build time

**D. What the Production Engineer validation agent checks:**
- [ ] `@sentry/nextjs` in dependencies
- [ ] `sentry.client.config.ts` and `sentry.server.config.ts` exist
- [ ] Error boundaries on every page component
- [ ] `SENTRY_DSN` in environment variables (not hardcoded)
- [ ] Source maps upload in build pipeline
- [ ] No session replay (DELTA compliance — PRI-09)
- [ ] Release tracking configured with git SHA
- [ ] Custom error context (language, page type, search query terms — no user identity)

### 23.4 New Relic Integration Pattern (Per Application)

**A. Browser Agent:**
```typescript
// Instrumentation agent adds browser monitoring:
// next.config.js
const newRelicConfig = {
  agent: 'browser',
  accountId: process.env.NEW_RELIC_ACCOUNT_ID,
  applicationId: process.env.NEW_RELIC_APP_ID,
  licenseKey: process.env.NEW_RELIC_BROWSER_KEY,
  // SPA monitoring for client-side navigation
  spa: true,
  // No session trace (DELTA compliance)
  session_trace: { enabled: false },
};
```

**B. Custom Attributes (DELTA-compliant):**
```typescript
// Per-transaction context — NEVER user identity
newrelic.addCustomAttributes({
  language: locale,                // en, es, hi
  deviceTier: getDeviceTier(),     // tier1, tier2, tier3
  pageType: 'search-results',     // page classification
  experimentId: experimentId,      // which experiment built this
  // NEVER: userId, sessionId, IP, location, behavioral data
});
```

**C. Alert Policies (auto-configured per application):**
```jsonc
{
  "policies": [
    {
      "name": "Error Rate",
      "condition": "error_rate > 5%",
      "threshold_duration": "5 minutes",
      "notification": "email"
    },
    {
      "name": "Response Time",
      "condition": "response_time > 2000ms (p95)",
      "threshold_duration": "5 minutes",
      "notification": "email"
    },
    {
      "name": "Apdex Score",
      "condition": "apdex < 0.8",
      "threshold_duration": "10 minutes",
      "notification": "email"
    }
  ]
}
```

**D. What the Production Engineer validation agent checks:**
- [ ] New Relic browser agent installed
- [ ] Custom attributes set (language, deviceTier, pageType)
- [ ] No session trace or user identity attributes (DELTA compliance)
- [ ] Alert policies configured for error rate, response time, Apdex
- [ ] Deployment markers configured (git SHA on deploy)
- [ ] Distributed tracing enabled for API routes
- [ ] Database query monitoring via pg_stat_statements integration

### 23.5 When to Design and Plan Observability

**Per-experiment observability lifecycle:**

| Phase | What Happens | Who |
|-------|-------------|-----|
| **Workflow config** | Staff enables/disables observability (enabled by default) | Staff |
| **Build stage** | Engineer/Instrumentation agent adds Sentry + New Relic | AI agent |
| **Validate stage** | Production Engineer agent verifies instrumentation completeness | AI agent |
| **Deploy stage** | Platform creates Sentry project + New Relic app via API | Platform |
| **Post-deploy** | Verify error reporting works (send test error, confirm receipt) | AI agent |
| **Operations** | SRE agent monitors alerts, suggests improvements | AI agent |
| **Promote to dev** | Observability config migrates with the code | Platform |

### 23.6 Best Practices (Encoded in Agent Prompts)

The Instrumentation Agent's system prompt encodes these best practices:

1. **Instrument at boundaries** — Every external call (DB, API, CDN) gets a Sentry span and New Relic segment
2. **Structured logging** — JSON logs with request ID correlation at every boundary (PRI-12)
3. **Error context, not identity** — Attach what happened (page, language, query), never who (DELTA)
4. **Graceful degradation** — If Sentry/New Relic scripts fail to load, the app still works
5. **Performance budgets as alerts** — Alert when JS bundle exceeds budget, not just when latency spikes
6. **Deployment markers** — Every deploy tagged with git SHA for change correlation
7. **Synthetic monitoring** — Health check endpoints that confirm critical paths work

### 23.7 Questions This Raises

- **Sentry project per experiment?** Or shared project with experiment tags? (Per-experiment is cleaner but creates sprawl)
- **New Relic app per experiment?** Same tradeoff. Recommendation: shared project/app with experiment-level tagging during experimentation; dedicated project/app when promoted to dev.
- **DELTA compliance verification** — How do we automatically verify that no agent accidentally adds user tracking? Answer: Compliance Agent checks for session replay, user ID, IP collection, behavioral profiling in the validation stage.
- **Cost of observability services** — Sentry and New Relic have per-event pricing. Many experiments = many events. Budget: include observability costs in experiment cost tracking.
- **Observability for the platform itself** — The agent orchestrator needs its own monitoring. How do we monitor the thing that monitors?

---

## 24. Claude Code as Universal Substrate

### 24.1 The Insight

Claude Code is not just the build-stage substrate — it is the natural substrate for **nearly every stage** of the workflow. Each stage is fundamentally an AI agent reading context, reasoning, and producing artifacts. Claude Code SDK provides exactly this: file system access, tool use (MCP, bash), skill invocation, and session management.

### 24.2 Substrate per Stage

| Stage | Current Design | Claude Code Substrate | Benefit |
|-------|---------------|----------------------|---------|
| **Research** | Direct API calls to Claude/Gemini Deep Research | Claude Code agent designs research prompts, submits to APIs, reads results, produces synthesis | Agent can iterate on research — if first round has gaps, design follow-up prompts |
| **Design** | Claude Code agents | Claude Code agents (no change) | Native |
| **Mediation** | Claude Code agent | Claude Code agent reads all design artifacts, uses `/compose crystallize, converge, review` | Skills provide cognitive structure for synthesis |
| **Build** | Claude Code agents | Claude Code agents (no change) | Native |
| **Validate** | Mix of CI tools + Claude Code agents | Claude Code agents invoke CI tools via bash, then reason about results | Agent can interpret test failures and suggest fixes, not just report them |
| **Deploy** | Platform MCP tools | Claude Code agent calls Platform MCP tools | Agent can verify deployment health, not just trigger deployment |
| **Notify** | Platform service | Claude Code agent drafts notification, calls email API | AI-written summaries are better than template-generated ones |

### 24.3 The Deep Research Stage with Claude Code

The Research stage benefits most from Claude Code as substrate:

```
Research Agent (Claude Code session)
  1. Reads experiment prompt and context
  2. Uses /explore to survey what's already known in the project
  3. Designs deep research prompts (Opus crafting prompts — proven pattern)
  4. Calls Claude Deep Research API via tool
  5. Calls Gemini Deep Research API via tool
  6. Reads both reports
  7. Uses /compose gaps, crystallize to synthesize
  8. Produces: research summary + gap analysis + recommended next steps
  9. Writes artifacts to experiment repo
```

This is richer than a simple API call because the agent can **iterate**. If the first research round reveals unexpected gaps, the agent designs follow-up prompts. If Claude and Gemini diverge on a critical point, the agent investigates the divergence.

### 24.4 What This Means Architecturally

**The agent orchestrator becomes simpler.** Instead of managing different execution environments per stage (API calls for research, Claude Code for build, CI tools for validation), every stage is a Claude Code SDK session with:
- A role-specific system prompt (from the agent role registry)
- A skill set (from skill-environments.json)
- MCP server access (Platform MCP, Neon MCP, etc.)
- File system access to the experiment repo

**The DAG executor's job** is reduced to:
1. Determine which stage runs next
2. Spawn a Claude Code session with the right role + skills + context
3. Pass the experiment repo path and previous stage artifacts
4. Collect the output artifacts
5. Check gate conditions
6. Advance to next stage or halt

### 24.5 Model Selection per Stage

Claude Code SDK supports model selection. The orchestrator sets the model per stage:

```jsonc
{
  "stages": {
    "research": { "model": "opus" },      // Research needs breadth and depth
    "design": { "model": "opus" },         // Design needs creativity
    "mediate": { "model": "opus" },        // Synthesis needs judgment
    "build": { "model": "sonnet" },        // Implementation is well-defined
    "validate": { "model": "sonnet" },     // Validation is checklist-driven
    "deploy": { "model": "haiku" },        // Deployment is mechanical
    "notify": { "model": "haiku" }         // Notification is template-driven
  }
}
```

Staff can override any of these. The comparative analysis engine (Section 7) tests different model assignments to find the cost-quality sweet spot.

---

## 25. Experiment-as-Repository — Audit Trail Architecture

### 25.1 The Natural Home

Each experiment IS a GitHub repository (or a branch in an existing repo). This makes the audit trail **native to the tooling** — not a separate system to maintain.

```
Experiment lifecycle = Git lifecycle:
  experiment_create    →  git init + initial commit (prompt, workflow config)
  research stage       →  commits with research artifacts
  design stage         →  commits with design artifacts
  build stage          →  commits with code (the actual application)
  validate stage       →  commits with test results, gate reports
  deploy stage         →  tag: v0.1.0-experimental
  review + revision    →  commits addressing feedback
  promote to dev       →  PR from experiment branch → dev branch
  decline              →  archive tag: declined-{reason}
```

### 25.2 Why GitHub, Not S3

| Dimension | GitHub Repository | S3 Bucket |
|-----------|------------------|-----------|
| **Versioning** | Native (every commit is a version) | Object versioning exists but is unstructured |
| **Diff visibility** | Native (git diff between any two states) | No diff capability |
| **Code + artifacts together** | Natural (code and docs in same tree) | Separate from code repo |
| **Review** | PR interface (comments, approvals, CI integration) | No review workflow |
| **Agent access** | Claude Code has native git access | Requires AWS SDK |
| **Platform integration** | Platform already manages git repos | Would need new integration |
| **Branching** | Natural (experiment branches from dev) | No concept |
| **Searchability** | GitHub search, git log, blame | S3 Select (limited) |
| **Cost** | Free for private repos (GitHub) | Storage + request costs |
| **Institutional memory** | git log IS the decision history | Would need separate metadata |
| **Collaboration** | Native (PR comments, review overlay) | No collaboration model |

**The verdict:** GitHub is unambiguously the right home. The experiment repo IS the audit trail. Every agent action is a commit. Every stage transition is a tag. Every human review is a PR comment. The entire decision history is `git log`.

### 25.3 Repository Structure for Experiments

**Standalone experiment (new project):**
```
convocation-2027/                    # New GitHub repo
├── .claude/
│   └── CLAUDE.md                   # Experiment context (auto-generated)
├── .experiment/                    # Experiment metadata (gitignored from app, not from audit)
│   ├── config.jsonc                # Workflow configuration
│   ├── prompt.md                   # Original staff prompt
│   ├── research/
│   │   ├── claude-research.md
│   │   ├── gemini-research.md
│   │   └── synthesis.md
│   ├── design/
│   │   ├── product-design.md
│   │   ├── visual-design.md
│   │   └── architecture.md
│   ├── mediation/
│   │   └── unified-spec.md
│   ├── validation/
│   │   ├── ci-results.json
│   │   ├── gate-accessibility.md
│   │   ├── gate-compliance.md
│   │   ├── gate-architecture.md
│   │   ├── gate-production-engineer.md
│   │   ├── gate-dba.md
│   │   ├── gate-low-bandwidth.md
│   │   └── gate-security.md
│   ├── costs/
│   │   └── token-usage.jsonl       # Append-only token log
│   └── sessions/
│       ├── research-agent.jsonl    # Session transcript
│       ├── design-agent.jsonl
│       ├── build-agent.jsonl
│       └── validate-agent.jsonl
├── app/                            # The actual application
│   └── ...
├── package.json
└── README.md                       # Auto-generated project overview
```

**Feature experiment (branch from existing project):**
```
yogananda-teachings/
├── (existing code)
└── .experiment/                    # Same structure, on experiment branch
    ├── config.jsonc
    ├── prompt.md
    └── ...
```

### 25.4 Scaling Considerations

**At 10 experiments/month:**
- 10 repos or branches. Trivially manageable. GitHub free tier handles this.

**At 100 experiments/month:**
- 100 repos. Still manageable. GitHub Organizations support unlimited repos.
- `.experiment/sessions/` JSONL files could grow large (agent session transcripts).
- Mitigation: compress session transcripts after experiment concludes.

**At 1,000 experiments/month (aspirational):**
- Repo sprawl becomes real. Need: auto-archive after 90 days of inactivity.
- Session transcripts: summarize and archive full transcripts to cold storage (S3 Glacier).
- Cost tracking: aggregate in platform Neon DB, keep granular JSONL in repo for audit.
- GitHub API rate limits: 5,000 requests/hour. Experiment lifecycle needs ~50 API calls. Limit: ~100 concurrent experiments.

**The hybrid model (if needed at scale):**
- GitHub repos remain the source of truth for code + decisions
- S3 becomes the archive for raw session transcripts (large, read-rarely)
- Platform Neon DB aggregates cost and quality metrics (query-often)
- This is a Phase 5 concern. Start with pure GitHub.

---

## 26. Skill Ecosystem Redesign for Autonomous Agents

### 26.1 The Shift

The current 43 skills were designed for **human-directed AI** — a human principal guides Claude through interactive dialogue. The autonomous agent platform needs skills that work for **AI-directed AI** — agents invoking skills without human intervention.

**The critical insight:** Most analytical skills already work for autonomous agents. The gap is in **judgment, creativity, iteration, and communication** — the skills that assume a human is steering.

### 26.2 Skills That Work As-Is (No Changes Needed)

These skills produce structured, machine-parseable output suitable for agent-to-agent handoff:

| Category | Skills | Why They Work |
|----------|--------|---------------|
| **Analysis** | `gaps`, `threat-model`, `scope`, `consequences`, `spec-survey`, `deep-review` | Produce prioritized finding lists with severity, location, action |
| **Implementation** | `implement`, `verify` | Produce file inventories, migration specs, compliance tables |
| **Quality** | `review`, `mission-align`, `doc-health`, `drift-detect` | Produce pass/fail findings with references |
| **Strategy** | `steelman`, `inversion` | Produce structured arguments suitable for agent debate |
| **Operations** | `ops-review`, `incident-ready`, `supply-chain-audit`, `hardening-audit` | Produce checklists with clear pass/fail |

**20+ skills ready for autonomous use without modification.** This is the existing toolkit's strongest asset.

### 26.3 Skills That Need Adaptation

These have high value but assume interactive human dialogue:

| Skill | Current Issue | Adaptation |
|-------|--------------|------------|
| **`invoke`** | Open-ended register-driven prose; beautiful for humans, unparseable for agents | Add `--structured` mode: output as `[concept, constraints, opportunities, inevitable_form]` while preserving the cognitive activation |
| **`converge`** | Prose-delta ("did the last pass add new findings?") | Add quantitative mode: `--threshold 0.05` (converge when finding-set delta < 5%) |
| **`land`** | Blocks on judgment calls ("this needs human input") | Add `--authority autonomous`: apply decision rubric, pick strongest path, annotate reasoning |
| **`crystallize`** | Needs "what must survive" guidance from human | Add `--preserve` flag with explicit structure preservation rules |
| **`archaeology`** | Layered questioning assumes human answers | Add `--autonomous` mode: agent generates and answers its own questions, surfaces assumptions as predicates |
| **`propose`** | Scope/structure needs human judgment | Accept structured requirements as input (not just prose) |

**Key design principle:** Adaptation means adding a mode, not replacing the human-directed mode. Skills work in both contexts:
- `authority=human` (default): current behavior, interactive dialogue
- `authority=autonomous`: decision rubrics, structured output, no blocking

### 26.4 New Skills the Platform Needs

**Tier 1: Judgment Infrastructure (enables autonomous execution)**

| Skill | Purpose | Output |
|-------|---------|--------|
| **`decide`** | Given a decision point + rubric (criteria, weights, thresholds), choose autonomously with reasoning | Decision + confidence score + reasoning trace |
| **`rubric-build`** | Convert open-ended guidance into quantified rubric | `{criterion, score_fn, threshold, weight}[]` |
| **`escalate`** | Determine when a decision exceeds autonomous authority | Escalation summary + suggested expert + context package |

**Tier 2: Agent Communication (enables multi-agent workflows)**

| Skill | Purpose | Output |
|-------|---------|--------|
| **`handoff`** | Package findings for downstream agent | Structured context object: summary + decisions + dependencies + ambiguities |
| **`converge-quantitative`** | Convergence detection using explicit metrics | Convergence verdict with numeric delta and pass/fail |
| **`debate`** | Multi-perspective argument generation with scoring | Perspective array: `[{position, evidence, impact_score, counter_arguments}]` |

**Tier 3: Reliability (enables resilient autonomous operation)**

| Skill | Purpose | Output |
|-------|---------|--------|
| **`recover`** | Structured error response with recovery options | `{error, diagnosis, recovery_options: [{strategy, confidence, side_effects}]}` |
| **`checkpoint`** | State snapshot before high-risk operation | Checkpoint ID + rollback instructions |

**Tier 4: Autonomous Creativity (enables design/research phases)**

| Skill | Purpose | Output |
|-------|---------|--------|
| **`structure-creative`** | `invoke`-like cognitive activation with structured output | `[concept, constraints, opportunities, form]` + alternatives array |
| **`surface-assumptions`** | Autonomous `archaeology` — generates and answers its own questions | `[{assumption, source, alternative, risk_if_violated}]` |

### 26.5 The Authority Parameter

The single most powerful change: add `authority` as a first-class parameter to `/calibrate`:

```
/calibrate authority=autonomous
```

This propagates to all subsequent skill invocations:
- **`authority=human`** (default): Skills pause on ambiguity, ask questions, produce open-ended findings
- **`authority=autonomous`**: Skills apply decision rubrics, pick strongest path, annotate reasoning, never block

This unlocks autonomous operation across most existing skills without rewriting them. The authority level travels with the agent session, not per-skill invocation.

### 26.6 Skill Environment for Agent Platform

Add a new skill environment to `config/skill-environments.json`:

```jsonc
{
  "experiment-agent": {
    "description": "Skills for autonomous experiment execution",
    "skills": [
      // Existing skills (work as-is)
      "implement", "verify", "scope", "gaps", "threat-model",
      "consequences", "review", "mission-align", "deep-review",
      "ops-review", "hardening-audit", "supply-chain-audit",
      "steelman", "inversion", "drift-detect",
      // Adapted skills (with --authority autonomous)
      "invoke", "converge", "land", "crystallize", "archaeology",
      // New skills
      "decide", "rubric-build", "escalate",
      "handoff", "converge-quantitative", "debate",
      "recover", "checkpoint",
      "structure-creative", "surface-assumptions"
    ],
    "default_calibration": {
      "authority": "autonomous",
      "directness": 10,
      "resolution": "high",
      "speculation": "bounded"
    }
  }
}
```

### 26.7 What We're Not Asking About Skills

- **Skill composability in autonomous context:** Does `/compose` work when agents invoke it? It assumes a single Claude session — can the orchestrator thread compose chains across agent boundaries?
- **Cognitive register in autonomous mode:** The toolkit's power comes from specific prompt language that activates cognitive registers. Does `authority=autonomous` flatten the cognitive richness? Empirical testing needed.
- **Skill versioning:** When agents A/B test different skill versions, how do we track which version produced which outcome?
- **Cross-project skills:** The platform serves multiple projects. Can skills be project-specific (portal skills vs. convocation skills) while sharing a common base?
- **Skill creation by agents:** Can an agent create a new skill during an experiment? Or must skills be pre-defined? The "ecosystem of preserved roles" concept suggests agents should be able to propose new skills, with human curation of the library.

---

## 27. Institutional Memory — FTR and Plan Document Strategy

### 27.1 What Gets Created

This vision document becomes the foundation for several institutional artifacts:

**FTR files (in yogananda-teachings features/):**

| FTR | Title | Domain | State | Contents |
|-----|-------|--------|-------|----------|
| **FTR-170** | AI Agent Convocation Platform — Vision | foundation | proposed | Sections 1-3 (staff experience, workflow architecture, agent roles) |
| **FTR-171** | Experiment Lifecycle and Platform Integration | operations | proposed | Sections 5, 25 (platform extensions, experiment-as-repository) |
| **FTR-172** | Agent Workflow Orchestration Engine | operations | proposed | Sections 2, 12, 24 (DAG execution, workflow designer, Claude Code substrate) |
| **FTR-173** | Agent Role Registry and Skill Ecosystem | foundation | proposed | Sections 3, 18, 26 (roles, expanded agents, skill redesign) |
| **FTR-174** | AI Validation Gates | operations | proposed | Sections 6, 11, 23 (CI/AI gates, adversarial testing, observability) |
| **FTR-175** | Comparative Analysis Engine | operations | proposed | Section 7 (model comparison, workflow comparison, prompt comparison) |
| **FTR-176** | Glass Box Operations and Cost Tracking | operations | proposed | Sections 20, 21 (cost attribution, glass box principle) |
| **FTR-177** | Deep Research Integration | search | proposed | Section 4, 22 (dual-platform research, prompt design) |
| **FTR-178** | Staff Empowerment and Onboarding | experience | proposed | Sections 13, 19 (who it serves, getting started, notifications) |

**Note:** FTR numbers are illustrative — actual numbers assigned at creation time based on current max across all domains.

### 27.2 Plan Document (Permanent Archive)

This vision document itself, refined with research findings, is archived at:

```
docs/plans/ftr-168-ai-agent-platform.md
```

Per project convention, plan documents in `docs/plans/` are "implementation plans archived as institutional memory (not ephemeral — checked into repo)." This is the first strategic vision plan (vs. implementation plan), expanding the purpose of the `docs/plans/` directory.

### 27.3 Deep Research Reports (Reference Documents)

The 4 deep research reports + 3 synthesis documents are archived at:

```
docs/reference/
├── deep-research-gemini-agent-orchestration.md
├── deep-research-claude-agent-orchestration.md
├── deep-research-gemini-sacred-digital-empowerment.md
├── deep-research-claude-sacred-digital-empowerment.md
├── synthesis-agent-orchestration-2026.md
├── synthesis-sacred-empowerment-2026.md
└── synthesis-ai-agent-platform-architectural-implications-2026.md
```

These join the existing 10+ deep research reference documents in `docs/reference/`, following the established naming convention.

### 27.4 Cross-Project Documentation

Since this vision spans three repos, documentation lives in each:

| Repo | What It Gets |
|------|-------------|
| **yogananda-teachings** | FTR-170–178 (vision, roles, gates, research), plan document, research reports |
| **yogananda-platform** | Platform extensions (experiment engine, MCP tools, dashboard) — documented in platform's own FTR/decision system |
| **yogananda-skills** | New skills (decide, handoff, escalate, etc.), skill environment config, authority parameter — documented in skills repo |

### 27.5 ROADMAP.md Update

Add to ROADMAP.md § Unscheduled Features:

```markdown
### AI Agent Convocation Platform (FTR-170–178)

Autonomous AI agent platform empowering SRF staff to create digital applications.
Pre-populated prompt templates, multi-agent DAG workflows, experiment-as-repository,
CI/AI validation gates, glass box cost tracking, deep research integration.
Convocation 2027 website as inaugural experiment.

**Dependencies:** STG-009 (corpus complete), yogananda-platform Phase 4+
**Deep research:** Pending (2 prompts designed, 12+8 topics)
**Governing principles:** PRI-01 (verbatim fidelity in agent-built sites),
  PRI-05 (global-first agent validation), PRI-08 (calm notifications),
  PRI-09 (DELTA-compliant observability), PRI-12 (AI-native operations)
```

### 27.6 FEATURES.md Update

Add new FTR entries to the index with cross-references to this plan document and to each other.

---

## 28. Edge Case and Failure Emphasis — Agent Roles as Adversarial Thinkers

### 28.1 The Critique

Every agent role should carry an adversarial dimension — not just the explicitly adversarial roles. The question every agent should ask at every stage:

- **During build:** "What will we wish we had designed for? What edge cases will surface in production that we're not testing for now?"
- **During operations:** "What will we wish we had instrumented? What failure mode are we blind to?"
- **Always:** "Where are the failure cases? What haven't we considered?"

### 28.2 Failure Scenario Registry

Each agent role maintains a **failure scenario registry** — a living document of known and anticipated failures for its domain:

| Agent Role | Example Failure Scenarios |
|-----------|-------------------------|
| **Frontend Engineer** | JS fails to load entirely; font CDN is down; browser doesn't support CSS Grid; RTL language layout breaks; iOS Safari renders differently |
| **Backend Engineer** | Database connection pool exhausted; API rate limit hit; request body exceeds limit; concurrent writes to same row; timezone mismatch |
| **Production Engineer** | Sentry is down (errors silently disappear); New Relic browser agent adds 50ms; source maps not uploaded (stack traces unreadable); alert fatigue from noisy thresholds |
| **DBA Agent** | Dead tuple bloat from missing autovacuum; index bloat after bulk delete; connection limit hit during traffic spike; query plan regression after ANALYZE |
| **Low-Bandwidth Tester** | DNS resolution takes 2s on 2G; TLS handshake adds 1.5s; fonts block rendering; images are 500KB each; service worker caches stale content |
| **Security Auditor** | Environment variables leaked in client bundle; CORS allows wildcard origin; API accepts unbounded query parameters; dependency with known CVE |
| **Compliance Agent** | Agent accidentally adds Google Analytics; session replay enabled by default in Sentry config; cookie set without consent; user agent string logged |
| **Architect** | New dependency pulls in 200KB of JS; API route returns unbounded result set; database migration is irreversible; third-party service has no SLA |

### 28.3 The "What Haven't We Considered?" Protocol

At the end of every validation stage, a meta-agent runs a structured "What haven't we considered?" analysis:

1. **Cross-agent blind spots** — What does the DBA know that the Frontend Engineer doesn't? What does the Security Auditor see that the Architect missed?
2. **Temporal blind spots** — What works today but breaks when traffic 10x? When a new language is added? When the CDN provider changes?
3. **Interaction blind spots** — What happens when two experiments modify the same shared component? When an experiment's domain gets indexed by search engines?
4. **Recovery blind spots** — If this fails at 2am, can an on-call human fix it? Or does it require the AI agent that built it?

---

## 29. MCP as the Universal Data Surface

### 29.1 The Insight

MCP is not just a tool invocation protocol — it is the **universal data surface** for the entire platform. Every piece of operational data (experiments, costs, agent sessions, validation results, architecture graphs) is accessible via MCP tools. The ops dashboard is one consumer; Claude Code is another; external AI agents are a third.

### 29.2 MCP Topology

```
                        ┌──────────────────┐
                        │  Ops Dashboard   │
                        │  (human visual)  │
                        └────────┬─────────┘
                                 │
                        ┌────────▼─────────┐
                        │   Platform MCP   │  ← Single data surface
                        │   (27+ tools)    │
                        └────────┬─────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                   │
     ┌────────▼────────┐ ┌──────▼──────┐  ┌────────▼────────┐
     │  Claude Code    │ │  Agent      │  │  External AI    │
     │  (operator)     │ │  Orchestr.  │  │  (future)       │
     └─────────────────┘ └─────────────┘  └─────────────────┘
```

**Everything goes through MCP.** The dashboard never queries the database directly — it calls MCP tools via the REST/HTTP gateway. This means:
- Any visualization the dashboard shows, Claude Code can also query
- Any metric a human sees, an AI agent can also reason about
- The data model is always the MCP tool schema — one contract, multiple consumers

### 29.3 MCP Tool Categories for the Agent Platform

**Existing Platform MCP (27 tools):**
- Environment: create, list, describe, promote, rollback, deploy_status, destroy
- Project: list, describe, register, create, bootstrap, audit, describe_chain, promotion_history
- Cost: get_costs, get_cost_breakdown, sync_costs, budget_check
- Review: list_reviews, create_review, resolve_review, trigger_ai_adjust
- Reconciler: reconcile_deployments, reconcile_environments

**New Experiment MCP Tools (15 tools):**
- Experiment lifecycle: create, list, describe, promote, decline, compare
- Workflow execution: list, describe, run, status
- Agent management: role_list, role_describe, role_create, session_log
- Cost forecasting: cost_forecast

**New Architecture MCP Tools (8 tools):**
- `architecture_graph` — Returns full service graph (nodes: services/components, edges: dependencies)
- `architecture_zoom` — Drill into a specific component (FTR associations, metrics, agent sessions)
- `architecture_metrics` — Real-time metrics for any node (latency, error rate, request rate)
- `architecture_ftr_map` — Which FTRs govern which components?
- `architecture_audit_trail` — Who built this component, when, with which agent?
- `architecture_cost_rollup` — Cost from component → project → platform
- `architecture_health` — Aggregate health score per service/project
- `architecture_suggest` — AI-driven suggestions (model optimization, log filtering, index additions)

### 29.4 MCP-Backed Operations Visualization

The ops dashboard renders data from MCP tools as interactive visualizations:

**Platform Level (yogananda.tech/ops):**
```
┌────────────────────────────────────────────────────────────┐
│  Platform Architecture                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ Teachings │───→│ Platform │←───│  Design  │             │
│  │  Portal   │    │   MCP    │    │  System  │             │
│  │ 2 envs   │    │  27 tools│    │ 2 envs   │             │
│  │ $19/mo   │    │  $0/mo   │    │ $0/mo    │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│       │                │                                    │
│  ┌────▼──────────┐ ┌──▼───────┐                           │
│  │ Experiments   │ │  Neon DB │                            │
│  │ 3 active     │ │  5 tables│                            │
│  │ $12.40 today │ │  $19/mo  │                            │
│  └──────────────┘ └──────────┘                            │
│                                                             │
│  Total Platform: $285.80/mo  │  Budget: 57% utilized       │
└────────────────────────────────────────────────────────────┘
```

**Application Level (click into Teachings Portal):**
```
┌────────────────────────────────────────────────────────────┐
│  Teachings Portal — Component Architecture                  │
│                                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐          │
│  │ Search │  │ Reader │  │ Browse │  │  API   │          │
│  │ FTR-020│  │ FTR-041│  │ FTR-056│  │ FTR-015│          │
│  │ 180ms  │  │  95ms  │  │ 120ms  │  │  45ms  │          │
│  │ 0.1% err│ │ 0% err │  │ 0% err │  │ 0.2%err│          │
│  └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘          │
│       │           │           │            │               │
│  ┌────▼───────────▼───────────▼────────────▼───┐          │
│  │              Neon PostgreSQL                  │          │
│  │  2,888 chunks │ 80K relations │ 6 topics     │          │
│  │  pg_stat: 0 dead tuples │ last vacuum: 2h    │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  Click any component to see: FTR details, agent sessions,  │
│  audit history, Sentry errors, New Relic APM, cost share   │
└────────────────────────────────────────────────────────────┘
```

**Component Level (click into Search):**
- FTR-020 specification summary
- Recent agent sessions that modified this component
- Sentry errors in last 24h
- New Relic response time percentiles
- Cost attribution (what fraction of Bedrock/Voyage spend is for search?)
- Git blame: which experiment/commit last changed each file

### 29.5 AI-Driven Insights via MCP

Because all data flows through MCP, AI agents can proactively analyze operations:

```
AI Operator (Claude Code session via MCP):
  "I notice the search component's P95 latency has increased 40ms over the last week.
   Checking pg_stat_statements... the enrichment_data JOIN is now scanning 2,888 rows
   instead of using the index. Suggesting: CREATE INDEX idx_chunks_enrichment_lookup
   ON chunks(book_id, language, chunk_index) WHERE enrichment_data IS NOT NULL.

   Estimated impact: -35ms on P95. Cost: negligible (small index).

   Should I create an experiment to test this change?"
```

---

## Verification

This is a strategic vision document, not an implementation plan. Verification would occur at each phase:

1. **Phase 0 (Now):** Validate vision with SRF IT leadership and philanthropist. Archive plan document. Submit deep research prompts. Create FTR-168–176 as proposed.
2. **Phase 1 (Prototype):** Build minimal experiment engine — single workflow (prompt → build → deploy → notify) with one model. Test with Convocation 2027 site.
3. **Phase 2 (Roles):** Add multi-agent roles, validation gates, review overlay integration. Implement new skills (decide, handoff, escalate). Add authority parameter.
4. **Phase 3 (Workflows):** Visual workflow designer, template library, deep research integration. Sentry/New Relic per-application automation.
5. **Phase 4 (Scale):** Multi-project support, YSS independence, comparative analysis engine. Skill ecosystem for autonomous agents.
6. **Phase 5 (Maturity):** Auto-generated reference materials, adversarial exercise protocol, institutional learning from experiment archive. Glass box operations at organizational scale.

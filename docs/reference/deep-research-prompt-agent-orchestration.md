# Deep Research Prompt: Multi-Agent Orchestration and Autonomous Software Delivery

**Purpose:** Inform the engineering architecture of the AI Agent Platform (FTR-168 through FTR-176). Covers the technical frontier: orchestration patterns, agent specialization, AI validation gates, autonomous code quality, cost control, experiment lifecycle, and operational observability.

**Submit to:** Both Claude Deep Research and Gemini Deep Research (web UI). Save each output as a separate reference document in this directory.

**FTRs informed:** FTR-168 (umbrella vision), FTR-170 (workflow orchestration), FTR-171 (role registry and skills), FTR-172 (AI validation gates), FTR-173 (comparative analysis), FTR-174 (glass box operations), FTR-169 (experiment lifecycle).

---

## Prompt

RESEARCH REQUEST: Multi-Agent AI Orchestration for Autonomous Software Delivery — Architecture, Evidence, and Failure Modes

CONTEXT: A philanthropically-funded organization is building a platform where non-technical staff (monastics, administrators, center leaders) enter a natural-language prompt and a team of autonomous AI agents builds a complete web application — research through deployment — and delivers it via email with a live URL.

The proposed architecture:

- DAG-based workflow: 7 stages (Research, Design, Mediation, Build, Validate, Deploy, Notify), each running one or more AI agents. Stages fan out (parallel) and fan in (merge).
- Claude Code SDK (Anthropic's agentic CLI) as the execution substrate for ALL stages — not just code generation. Each stage is a separate Claude Code session with a role-specific system prompt, tool permissions, and skill set.
- 30+ specialized agent roles organized across 6 phases (Research, Design, Build, Validate, Adversarial, Operations), each with a versioned system prompt, reading strategy, and model recommendation.
- JSONC workflow configuration (chosen over YAML because LLMs produce valid JSON more reliably — YAML indentation is the #1 source of AI-generated config errors).
- Artifact-based handoff: agents communicate through files committed to a shared Git repository, not message passing. Each stage reads the previous stage's artifacts and writes its own.
- MCP (Model Context Protocol) as the universal data surface — the ops dashboard, Claude Code, and the agent orchestrator all consume the same MCP tools.
- GitHub as the audit trail: each experiment IS a repository (or branch). Git history is the decision record. Agent actions are commits, stage transitions are tags, human reviews are PR comments.
- Infrastructure: Neon PostgreSQL, Vercel, AWS Bedrock (Claude Opus/Sonnet/Haiku), a shared design token library, and 43 cognitive skills (structured prompt compositions for analysis, review, implementation, etc.).
- The platform serves two organizations (US-based and India-based) sharing infrastructure but with independent content, design tokens, and approval workflows.

We need evidence, failure modes, and edge cases — not surveys. For each topic, tell us what works, what fails, and what nobody has solved. Emphasize: when we are building this, what will we wish we had designed for? When we are operating it, what will we wish we had asked about? Where are the failure cases? What haven't we considered?

Conduct a thorough investigation across the following 8 topics. For each, cite specific production systems, academic papers, or documented implementations from 2024–2026.

TOPIC 1: Multi-Agent Orchestration — What Actually Works in Production

Survey the multi-agent orchestration landscape, but focus on what has been deployed in production serving real users with real stakes — not demos, not research prototypes.

Investigate:
- CrewAI, AutoGen/AG2, LangGraph, Anthropic Claude Agent SDK, OpenAI Swarm, Semantic Kernel, and CI/CD pipeline engines adapted for agents (Dagger, Temporal, Argo Workflows). Which have production deployments at organizational scale?
- Our design uses artifact files in a Git repository as the handoff mechanism between agents. Is there precedent for "file-based" agent communication? How does this compare to message passing, shared memory/blackboard, and structured handoff protocols?
- Fan-out/fan-in: we run 3 design agents in parallel (Product Designer, Visual Designer, Architect), then merge via a Mediation agent. How do existing frameworks handle parallel agents whose outputs must be synthesized into a coherent whole? What goes wrong when parallel agents produce contradictory outputs?
- Error recovery for non-deterministic agents: when an LLM agent produces unusable output (hallucinated architecture, broken code, contradictory design), what recovery strategies exist? Retry with different temperature? Fallback to a different model? Human escalation? Circuit breaker after N failures?
- State management across a 7-stage pipeline where each stage is a separate execution context. Where does workflow state live? How do you resume a failed pipeline mid-stage without re-running completed stages?
- What breaks at scale? At 10 experiments/month the orchestrator is trivial. At 100/month? At 500? What are the failure modes that only emerge at scale — resource contention, rate limiting, context pollution between experiments, model API throttling?
- What failure modes does nobody talk about? What are the silent killers of multi-agent systems in production? Context window overflow? Cascading hallucinations? Agent "laziness" in later pipeline stages?

TOPIC 2: "One Substrate, Many Roles" — Claude Code SDK as Universal Agent Execution Environment

We propose that every workflow stage — not just code generation — runs as a Claude Code SDK session. Research, design, mediation, validation, deployment, and notification all use the same substrate with different system prompts and tool permissions. This is a strong architectural bet.

Investigate:
- How does Claude Code SDK compare to other agentic environments (Cursor Agent Mode, Devin, Windsurf, OpenHands/OpenDevin, SWE-Agent, Aider) as a GENERAL-PURPOSE agent substrate, not just for coding? Can it effectively execute research synthesis, design mediation, accessibility auditing, and stakeholder communication?
- The "one substrate, many roles" pattern: same execution environment, different system prompts and tool permissions per stage. Is there evidence for or against this approach? Compared to heterogeneous substrates (one tool for research, another for build, another for validation)?
- Our agents have access to 43 pre-defined "skills" — structured prompt compositions for specific cognitive tasks (gap analysis, threat modeling, review, implementation planning, convergence testing). Does structured prompt composition improve agent output quality compared to role-only prompting? Any evidence?
- Tool overload: when an agent has access to MCP servers, bash commands, file system operations, AND 43 skill prompts, does it get confused about which tool to use? Is there a practical limit to the tool count an agent can handle effectively? What happens to output quality as the tool set grows?
- Long-running sessions vs. discrete task handoff: we chose separate sessions per stage with artifact files as handoff. The alternative is one long session across multiple stages. What are the tradeoffs? Does session length affect output quality? Where is the breakpoint?
- What edge cases emerge? What happens when Claude Code SDK is rate-limited mid-stage? When a session exceeds context window? When a tool (MCP server) is temporarily unavailable? What's the recovery path for each?

TOPIC 3: Agent Specialization vs. Generalism — The Empirical Evidence

We designed 30+ agent roles: Frontend Engineer, Backend Engineer, Accessibility Auditor, Production Engineer, DBA, Low-Bandwidth Tester, Content Integrity Auditor, Chaos Engineer, and more. The alternative: fewer, broader agents that each handle multiple concerns.

Investigate:
- Empirical evidence for and against role specialization in multi-agent LLM systems. Does a "Frontend Engineer" agent write better React components than a "Full-Stack Engineer" given the same task? Does a dedicated "Security Auditor" find more vulnerabilities than a general "Reviewer"?
- The committee-of-experts pattern vs. single-genius pattern. When multiple specialist agents each contribute to a system, how does output coherence suffer? Is there a point of diminishing returns where adding more specialists hurts overall quality?
- The mediator/synthesizer pattern: a dedicated agent (our "Design Mediator") reads all parallel specialist outputs and produces a unified specification. Does this work? What are the failure modes? Can the mediator reliably detect and resolve contradictions between specialists?
- Cost-quality tradeoff: running 8 Sonnet-class specialist agents vs. 2 Opus-class generalist agents for equivalent tasks. Is there data comparing multi-agent-cheap-model vs. few-agent-expensive-model on code quality, design coherence, or bug rates?
- The "authority parameter" concept: the same agent and skill set, but toggling between two modes — "authority=human" (pause on ambiguity, ask questions) and "authority=autonomous" (apply decision rubrics, choose the strongest path, annotate reasoning, never block). Is there precedent for this pattern? How do autonomous agents handle genuine ambiguity where the right answer depends on organizational judgment, not technical correctness?
- Agent role versioning: when you improve an agent's system prompt, how do you track which version produced which output? How do you A/B test prompt changes across agent roles? What are the practices for prompt version control in production multi-agent systems?
- What are we not asking? Is 30+ roles the right number, or is there evidence for an optimal role count? Should roles be decomposed differently — by CONCERN (security, accessibility, performance) rather than by DISCIPLINE (frontend, backend, DBA)?

TOPIC 4: AI Agents as CI/CD Validation Gates — The Non-Determinism Problem

We propose AI agents as CI pipeline stages: an Accessibility Auditor, Security Auditor, Architecture Reviewer, Principles Validator, Production Engineer, Low-Bandwidth Tester, Database Administrator, and Content Integrity Auditor. Each runs during the validation stage and can block promotion.

Investigate:
- AI code review in production CI pipelines (CodeRabbit, GitHub Copilot code review, Codium/Qodo, Amazon CodeGuru, Sourcery). What are the documented false positive rates? At what false positive threshold do engineering teams lose trust and start ignoring the gate? What's the real-world experience?
- THE FUNDAMENTAL PROBLEM: AI validation is non-deterministic. Run the same accessibility audit twice, get different results. How do you make AI gates reliable enough for CI? Specific mechanisms: majority voting (run 3 times, take consensus)? Threshold scoring (pass if score > 0.8)? Temperature=0 with deterministic sampling? Structured output schemas that constrain the variance? What works?
- AI accessibility auditing beyond rule-based tools (axe-core, Lighthouse). Can an AI agent understand SEMANTIC accessibility that automated tools miss — meaningful alt text quality, logical reading order, screen reader flow coherence, cognitive load assessment? Evidence of AI outperforming rule-based accessibility tools?
- AI architecture compliance: detecting scope creep (agent introduced an unauthorized cloud service), dependency hygiene (new package that pulls in 200KB of JS), pattern violations (component doesn't use the design system tokens). Anyone doing this in production? What are the results?
- The adversarial testing pattern: dedicated agents that attack the output before deployment — a Chaos Engineer simulating infrastructure failures, a Performance Saboteur load-testing on simulated 2G, a Content Integrity Auditor verifying every quote is verbatim from the source corpus. Any precedent for adversarial AI agents in a CI pipeline?
- Regression detection by AI agent: comparing before-and-after metrics (bundle size, Lighthouse scores, test coverage, accessibility violations) and blocking promotion if regression detected. Is AI regression detection more effective than simple threshold-based rules? When does AI add value over a shell script that checks "if bundle_size > limit then fail"?
- What happens when gates DISAGREE? Our Security Auditor might say "safe" while the Architecture Reviewer says "this dependency is risky." The Accessibility Auditor passes but the Low-Bandwidth Tester fails because the accessible solution is too heavy for 2G. How do you resolve inter-gate conflicts? Who wins?
- What edge cases will surface in production that we're not testing for now? AI gates that pass on the happy path but fail when confronted with: generated code that wraps third-party components (the auditor can't see inside them), dynamic content loaded at runtime (can't be statically analyzed), internationalized text (accessibility differs by language), or progressive enhancement (the no-JS fallback path isn't validated)?

TOPIC 5: Autonomous Code Generation — Quality, Safety, and the Revision Loop

AI agents generate the entire application: React components, API routes, database migrations, CSS, tests. Staff review the live site and leave feedback. Agents revise and redeploy. This cycle repeats until the staff member approves or declines.

Investigate:
- Code quality metrics for AI-generated code vs. human-written code IN PRODUCTION (not benchmarks). Bug rates, security vulnerability rates, maintainability indices, technical debt accumulation. Best available data from 2024–2026 (SWE-bench, Devin evaluations, Cursor usage studies, enterprise adoption reports).
- Style consistency when multiple agents contribute to one codebase. If 5 different agent sessions each generate React components, does the codebase feel coherent? Do naming conventions, patterns, and idioms stay consistent? Techniques for enforcing style across agent sessions beyond linting — architectural consistency, component composition patterns, state management consistency.
- The "design system as constraint" pattern: providing design tokens (colors, typography, spacing, component specs) as part of the agent's context so it generates visually consistent output. How effective is this? Do agents reliably use token variables instead of hardcoded values?
- Safety boundaries and risk classification: what should AI agents NEVER do autonomously? A framework for classifying operations by risk — reading a file is safe, writing a component is moderate, running a database migration is high, deleting data is prohibited. Any existing taxonomies for agent action risk?
- Context limits: our application codebases will grow across agent sessions. What happens when the codebase exceeds the context window? RAG over codebase? Selective file loading? Summarized context? How does code quality degrade as the amount of code exceeds what the agent can see at once?
- The revision loop: staff reviews AI-generated site, leaves inline comments ("this heading should be larger," "add a registration link here," "the colors don't feel right"), agents interpret and revise, site redeploys. How many cycles does this take to converge? Is there data on review-revise loop efficiency with AI agents? What failure modes emerge — the agent that "fixes" one comment by breaking something else? The staff member whose feedback is too vague for the agent to act on?
- What will we wish we had designed for? Generated code that works in development but fails in production (environment-specific bugs). Tests that pass but don't actually test the right things (coverage theater). Components that render correctly in Chrome but break in Safari or on mobile. Database migrations that work on empty databases but fail on production data. Progressive enhancement that degrades further than intended on constrained devices.

TOPIC 6: Cost Attribution and Budget Control for Multi-Agent Systems

Every token is philanthropic money. The platform tracks cost per experiment, per stage, per agent, per model. Circuit breakers prevent runaway spending.

Investigate:
- Token-level cost attribution across multi-agent workflows: tracking which agent consumed how many input/output tokens on which model at which stage. Existing tools, libraries, or approaches for this granularity? Specific to AWS Bedrock: how granular is the token tracking? Can you attribute tokens to a specific Claude Code SDK session?
- Cost forecasting: predicting what an experiment will cost BEFORE running it, based on workflow template, model selection, and historical data from similar experiments. Any implementations? How accurate are LLM cost predictions?
- The "cheapest effective model" optimization: systematically finding the least expensive model per task type that meets a quality threshold. For example, maybe Haiku is sufficient for the Deploy stage but Opus is necessary for Design Mediation. How do you build this empirical understanding? Is there a methodology?
- Budget circuit breakers: what happens when an agent enters an infinite refinement loop (keeps improving code that's already good enough)? Or when a research agent keeps finding "one more thing to investigate"? Production-tested approaches for token budget enforcement, per-stage spending limits, and graceful termination?
- Organizational cost visibility: what do non-technical leaders (a philanthropist funding the platform, an executive overseeing IT) need to see? Not token counts — meaningful cost context. "This experiment cost $4.20, which is below average" vs. "This month's total is 57% of budget." Any examples of AI cost dashboards designed for non-technical stakeholders?
- What cost failures will surprise us? Model pricing changes mid-experiment. Exponential cost growth when agents iteratively refine. Hidden costs (MCP server calls, external API calls, embedding generation) that don't show up in LLM token counts. Rate limiting that forces retries, doubling cost. Context window overflow that causes repeated summarization, adding cost at every stage.

TOPIC 7: Experiment-as-Repository — Git as Institutional Memory

Each experiment is a GitHub repository. Each agent action is a commit. Each stage transition is a tag. Each human review is a PR comment. The entire decision chain — from prompt to research to design to code to validation to approval — lives in one repository.

Investigate:
- Git-based audit trails for AI-generated systems. Is any organization using git history as the primary decision record for autonomous AI outputs? Not just version control for AI-generated code, but using the commit graph as the traceable chain from intent to implementation.
- Decision traceability: given a line of code, trace back to the design decision that required it, the research that informed that decision, and the staff prompt that initiated the experiment. How do you maintain this chain when the intermediaries are AI agents, not humans? What breaks in the chain?
- Scaling experiment repositories: at what point does one-repo-per-experiment become unmanageable? GitHub API rate limits (5,000 requests/hour), organization repository limits, storage costs, search across repositories. What's the practical ceiling? When should you switch from pure GitHub to a hybrid (GitHub for code + external store for large artifacts)?
- Institutional learning from experiment archives: after 100 experiments, the organization has empirical data on which prompts produce the best outcomes, which model combinations are most cost-effective, which workflow stages catch the most issues. Is anyone mining AI experiment archives for systematic improvement? The self-improvement loop: past experiment data improving future prompts and workflows. Any production implementations?
- Repository structure for AI experiments: what metadata belongs in the repo vs. in an external database? Our design puts everything in the repo (prompt, research artifacts, design specs, validation results, cost logs, session transcripts). Is this the right boundary? What about large artifacts (full agent session transcripts can be 100KB+ per stage)?
- What operational failures will we wish we had anticipated? Experiment repos that accumulate and are never cleaned up (sprawl). Stale experimental domains that keep running and accumulating infrastructure costs. Archived experiments that reference dependencies no longer available. Merged experiments that introduce conflicts with other recently-merged experiments. An experiment that promotes successfully but its validation was run against an outdated dev branch.

TOPIC 8: Observability of the Agent Pipeline Itself — Monitoring the Monitors

The platform builds applications that have their own observability (Sentry, New Relic). But the agent pipeline — the orchestrator, the agent sessions, the DAG execution — also needs monitoring. This is the meta-observability problem.

Investigate:
- How do you debug a failed experiment? The pipeline produced a broken application. Which of the 7 stages went wrong? Was it bad research (wrong conclusions fed into design)? Bad design (architect and visual designer contradicted each other)? Bad build (code doesn't match the spec)? Bad validation (gates missed a critical issue)? What diagnostic tools and patterns exist for multi-agent pipeline debugging?
- Agent session transcript analysis: given the full transcript of an agent's Claude Code session, can you automatically identify quality signals? Moments where the agent went in circles, made bad decisions, or missed context? Patterns in transcripts that predict good or bad outcomes?
- The cascading failure problem: a mistake in an early stage (Research produces wrong conclusions) propagates through all subsequent stages. By the time the Validation stage catches it, the platform has wasted 6 stages of compute. Can you detect upstream errors earlier? Signal quality checks between stages? Early termination when confidence is low?
- Agent disagreement and conflict: during the Validation stage, 7+ agents run in parallel. The Security Auditor says the dependency is risky; the Architect says it's the right choice. The Accessibility Auditor approves; the Low-Bandwidth Tester fails because the accessible solution is too heavy. How do you resolve agent-vs-agent conflicts? Weighted voting? Hierarchical authority? Human escalation triggers?
- Observability separation: the agent-built APPLICATION has Sentry + New Relic. The agent PLATFORM has its own monitoring. How do you keep these cleanly separated? When the platform's monitoring interferes with or gets confused with the application's monitoring, what happens? Shared Sentry project with tags vs. dedicated projects?
- What monitoring gaps will we discover in production? The agent that appears to succeed (commits clean code, passes validation) but produces subtly wrong output that only becomes apparent when humans use the site. The pipeline that hangs indefinitely on a stage because the agent is waiting for a tool response that will never come. The orchestrator that loses track of experiment state during a crash and can't resume. The experiment that promotes to dev but whose validation results are stale (code changed after validation ran).

SYNTHESIS — DECISIONS, NOT SUMMARIES:

After investigating all 8 topics, provide:

1. The 3 architectural decisions this research would change — specific enough to act on (e.g., "use X instead of Y because evidence shows..." or "don't do Z, it fails because..."). Not hedged recommendations — clear positions with supporting evidence.

2. The 2 biggest unsolved problems — things nobody has cracked yet, where we are designing into genuine uncertainty. Not problems that are merely hard, but problems where the solution approach is UNKNOWN.

3. The most dangerous assumption in our architecture — the single thing most likely to be wrong, and what happens if it is. What's the fallback?

4. The failure mode nobody is talking about — the operational surprise that multi-agent platforms encounter in production that isn't in any paper or blog post. The thing that breaks at 2am.

5. The single most important production system to study — the closest real-world system to this vision. Not necessarily AI — could be a CI/CD platform, a workflow orchestration system, or a multi-agent deployment. The one system whose operational lessons would most inform our architecture.

6. What question should we have asked that this prompt didn't? What blind spot does this entire prompt reveal?

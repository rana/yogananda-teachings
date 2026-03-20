# Session Prompts

Rerunnable specifications for the AI Agent Platform (yogananda-platform). Each file is a complete, self-contained instruction set that could re-implement its stage from scratch.

**Usage:** Copy the Prompt section into a new Claude Code session targeting `~/prj/yogananda-platform`. The "What Already Exists" section describes prerequisite infrastructure — the "What to Build" section is the work.

**Convention:** Files are named `stg-NNN-{slug}.md`. Each contains: repo, model, governing FTRs, files to read, existing state, deliverables, model constraints.

| File | Stage | Track |
|------|-------|-------|
| `stg-010-spike.md` | STG-010: SDK Spike | Platform |
| `stg-011-build.md` | STG-011: Minimal Loop | Platform |
| `stg-012-pipeline.md` | STG-012: Real Pipeline | Platform |
| `stg-013-production.md` | STG-013: Production Readiness | Platform |

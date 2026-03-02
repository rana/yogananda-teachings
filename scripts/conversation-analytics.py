#!/usr/bin/env python3
"""
Conversation analytics for Claude Code sessions.

Mines JSONL conversation transcripts for:
- Skill/command usage frequency
- Topic classification
- User correction patterns (where Claude was redirected)
- Session size and engagement metrics
- Tool usage patterns
- Repeated instructions across sessions

Usage:
    python3 scripts/conversation-analytics.py [--project PATH] [--output PATH] [--corrections-only]

Defaults to the SRF project conversation directory.
"""

import json
import os
import glob
import re
import sys
import argparse
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_PROJECT_DIR = os.path.expanduser(
    "~/.claude/projects/-home-rana-prj-yogananda-teachings"
)


def parse_args():
    parser = argparse.ArgumentParser(description="Claude Code conversation analytics")
    parser.add_argument(
        "--project", default=DEFAULT_PROJECT_DIR, help="Project conversation directory"
    )
    parser.add_argument(
        "--output",
        default="scripts/conversation-analytics-report.md",
        help="Output report path",
    )
    parser.add_argument(
        "--corrections-only",
        action="store_true",
        help="Only extract correction patterns",
    )
    parser.add_argument(
        "--top-n", type=int, default=20, help="Number of top items to show"
    )
    return parser.parse_args()


# Signals that the user is correcting Claude's behavior
CORRECTION_PATTERNS = [
    (r"\bno[,.]?\s+(I|that|it|don'?t|not)\b", "direct_no"),
    (r"\bactually[,.]?\s", "actually"),
    (r"\binstead[,.]?\s", "instead"),
    (r"\bwrong\b", "wrong"),
    (r"\bthat'?s not (what|right|correct)", "thats_not"),
    (r"\bI (said|meant|asked|wanted)\b", "i_meant"),
    (r"\bstop\b", "stop"),
    (r"\brevert\b", "revert"),
    (r"\bundo\b", "undo"),
    (r"\bdon'?t (do|add|change|modify|create|remove|delete)\b", "dont_do"),
    (r"\bnot what I\b", "not_what_i"),
    (r"\bI didn'?t (ask|want|say|mean)\b", "didnt_ask"),
    (r"\byou (missed|forgot|skipped|ignored)\b", "you_missed"),
    (r"\btoo (much|many|long|verbose|complex)\b", "too_much"),
    (r"\bsimpl(er|ify|e)\b", "simplify"),
    (r"\bjust\s+(do|make|use|add|remove)\b", "just_do"),
]

# Skill/command invocation patterns
SKILL_PATTERN = re.compile(
    r"<command-name>/(\w[\w-]*)</command-name>"
)

# Topic signal words
TOPIC_SIGNALS = {
    "search": ["search", "query", "BM25", "vector", "embedding", "hybrid", "RRF"],
    "design": ["design", "DES-", "architecture", "ADR-", "decision"],
    "book_ingestion": ["ingest", "book", "kindle", "ASIN", "chapter", "extract", "screen"],
    "principles": ["PRI-", "principle", "mission", "calm", "DELTA"],
    "proposals": ["PRO-", "proposal", "proposal-merge", "dedup"],
    "infrastructure": ["terraform", "neon", "vercel", "AWS", "deploy", "CI", "bootstrap"],
    "frontend": ["page", "component", "UI", "typography", "font", "responsive", "CSS"],
    "multilingual": ["language", "Hindi", "Spanish", "multilingual", "translation", "i18n"],
    "editorial": ["editorial", "staff", "workflow", "curate", "content"],
    "commit": ["commit", "push", "branch", "merge", "PR"],
    "meta": ["skill", "hook", "CLAUDE.md", "memory", "workflow", "process"],
    "cognitive": ["explore", "think", "reflect", "imagine", "consider"],
}


def extract_text(content):
    """Extract plain text from message content (string or content blocks)."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict):
                if block.get("type") == "text":
                    parts.append(block.get("text", ""))
        return " ".join(parts)
    return ""


def parse_conversation(filepath):
    """Parse a single JSONL conversation file."""
    session = {
        "file": os.path.basename(filepath),
        "size": os.path.getsize(filepath),
        "mtime": os.path.getmtime(filepath),
        "user_messages": [],
        "assistant_messages": [],
        "tools_used": Counter(),
        "skills_invoked": [],
        "corrections": [],
        "topics": Counter(),
        "turn_count": 0,
    }

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                d = json.loads(line)
            except json.JSONDecodeError:
                continue

            msg_type = d.get("type", "")
            is_meta = d.get("isMeta", False)

            if msg_type == "user" and not is_meta:
                session["turn_count"] += 1
                message = d.get("message", {})
                if isinstance(message, dict):
                    content = message.get("content", "")
                    text = extract_text(content)
                    session["user_messages"].append(text)

                    # Detect skill invocations
                    for m in SKILL_PATTERN.finditer(text):
                        session["skills_invoked"].append(m.group(1))

                    # Detect corrections
                    for pattern, label in CORRECTION_PATTERNS:
                        if re.search(pattern, text, re.IGNORECASE):
                            session["corrections"].append({
                                "label": label,
                                "text": text[:500],
                                "file": session["file"],
                            })
                            break  # One correction label per message

                    # Classify topics
                    for topic, keywords in TOPIC_SIGNALS.items():
                        for kw in keywords:
                            if kw.lower() in text.lower():
                                session["topics"][topic] += 1
                                break

            elif msg_type == "assistant":
                message = d.get("message", {})
                if isinstance(message, dict):
                    content = message.get("content", [])
                    if isinstance(content, list):
                        for block in content:
                            if isinstance(block, dict):
                                if block.get("type") == "tool_use":
                                    session["tools_used"][block.get("name", "unknown")] += 1
                    text = extract_text(content) if isinstance(content, list) else extract_text(content)
                    session["assistant_messages"].append(text[:200])

    return session


def classify_session(session):
    """Classify a session by its dominant topic."""
    if not session["topics"]:
        return "uncategorized"
    return session["topics"].most_common(1)[0][0]


def find_repeated_instructions(sessions):
    """Find phrases that appear in user messages across multiple sessions."""
    # Extract unique user phrases per session (first message only, as it sets context)
    session_phrases = defaultdict(set)
    for s in sessions:
        if s["user_messages"]:
            first = s["user_messages"][0][:500].lower()
            # Extract meaningful 4-grams
            words = re.findall(r'\b\w+\b', first)
            for i in range(len(words) - 3):
                gram = " ".join(words[i:i+4])
                if len(gram) > 15:  # Skip trivial
                    session_phrases[gram].add(s["file"])

    # Filter to phrases appearing in 3+ sessions
    repeated = {
        phrase: files
        for phrase, files in session_phrases.items()
        if len(files) >= 3
    }
    return dict(sorted(repeated.items(), key=lambda x: -len(x[1]))[:30])


def generate_report(sessions, top_n=20):
    """Generate the analytics report."""
    lines = []
    lines.append("# Conversation Analytics Report")
    lines.append(f"\n*Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}*")
    lines.append(f"\n**Corpus:** {len(sessions)} conversations, "
                 f"{sum(s['size'] for s in sessions) / 1024 / 1024:.0f} MB total")

    if sessions:
        oldest = min(s["mtime"] for s in sessions)
        newest = max(s["mtime"] for s in sessions)
        lines.append(f"**Date range:** {datetime.fromtimestamp(oldest, timezone.utc).strftime('%Y-%m-%d')} to "
                     f"{datetime.fromtimestamp(newest, timezone.utc).strftime('%Y-%m-%d')}")

    # Skill usage
    skill_counts = Counter()
    for s in sessions:
        for skill in s["skills_invoked"]:
            skill_counts[skill] += 1

    lines.append("\n## Skill/Command Usage")
    lines.append("\n| Rank | Skill | Invocations | % of sessions |")
    lines.append("|------|-------|-------------|---------------|")
    for i, (skill, count) in enumerate(skill_counts.most_common(top_n), 1):
        pct = count / len(sessions) * 100
        lines.append(f"| {i} | `/{skill}` | {count} | {pct:.0f}% |")

    unused_skills = set()
    # Check against known skills
    known_skills = [
        "explore-act", "explore", "commit", "compose", "arc-gate", "calibrate",
        "morning", "park", "resume", "scope", "consequences", "steelman",
        "inversion", "implement", "verify", "deep-review", "doc-health",
        "coherence", "gaps", "api-review", "docs-quality", "threat-model",
        "hardening-audit", "ghost", "launch-gate", "ops-review", "incident-ready",
        "supply-chain-audit", "archaeology", "triad", "reframe", "cognitive-debug",
        "drift-detect", "garden", "tomorrow", "context-switch", "workflow-trace",
        "why-chain", "crystallize", "seeker-ux", "mission-align", "cultural-lens",
        "dedup-proposals", "proposal-merge", "theme-integrate",
    ]
    for skill in known_skills:
        if skill not in skill_counts:
            unused_skills.add(skill)

    if unused_skills:
        lines.append(f"\n**Never invoked ({len(unused_skills)}):** " +
                     ", ".join(f"`/{s}`" for s in sorted(unused_skills)))

    # Topic distribution
    topic_totals = Counter()
    for s in sessions:
        for topic, count in s["topics"].items():
            topic_totals[topic] += count

    lines.append("\n## Topic Distribution")
    lines.append("\n| Topic | Signal hits | Sessions touching |")
    lines.append("|-------|------------|-------------------|")
    topic_sessions = defaultdict(int)
    for s in sessions:
        for topic in s["topics"]:
            topic_sessions[topic] += 1
    for topic, count in topic_totals.most_common():
        lines.append(f"| {topic} | {count} | {topic_sessions[topic]} |")

    # Tool usage
    tool_totals = Counter()
    for s in sessions:
        for tool, count in s["tools_used"].items():
            tool_totals[tool] += count

    lines.append("\n## Tool Usage (Top 20)")
    lines.append("\n| Tool | Total calls |")
    lines.append("|------|------------|")
    for tool, count in tool_totals.most_common(top_n):
        lines.append(f"| `{tool}` | {count} |")

    # Session size categories
    lines.append("\n## Session Engagement")
    categories = {
        "trivial (<10KB)": [s for s in sessions if s["size"] < 10000],
        "short (10-100KB)": [s for s in sessions if 10000 <= s["size"] < 100000],
        "medium (100KB-1MB)": [s for s in sessions if 100000 <= s["size"] < 1000000],
        "substantial (1-5MB)": [s for s in sessions if 1000000 <= s["size"] < 5000000],
        "major (>5MB)": [s for s in sessions if s["size"] >= 5000000],
    }
    lines.append("\n| Category | Count | Avg turns | Top topic |")
    lines.append("|----------|-------|-----------|-----------|")
    for cat, cat_sessions in categories.items():
        if cat_sessions:
            avg_turns = sum(s["turn_count"] for s in cat_sessions) / len(cat_sessions)
            cat_topics = Counter()
            for s in cat_sessions:
                dominant = classify_session(s)
                cat_topics[dominant] += 1
            top = cat_topics.most_common(1)[0][0] if cat_topics else "—"
            lines.append(f"| {cat} | {len(cat_sessions)} | {avg_turns:.0f} | {top} |")

    # Correction patterns
    all_corrections = []
    for s in sessions:
        all_corrections.extend(s["corrections"])

    correction_types = Counter(c["label"] for c in all_corrections)

    lines.append("\n## Correction Patterns")
    lines.append(f"\n**Total corrections detected:** {len(all_corrections)} across "
                 f"{sum(1 for s in sessions if s['corrections'])} sessions "
                 f"({sum(1 for s in sessions if s['corrections']) / len(sessions) * 100:.0f}% of sessions)")

    lines.append("\n| Pattern | Count | Example |")
    lines.append("|---------|-------|---------|")
    for label, count in correction_types.most_common(top_n):
        # Find first example
        example = next((c["text"][:120] for c in all_corrections if c["label"] == label), "—")
        example = example.replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{label}` | {count} | {example}... |")

    # Repeated instructions
    repeated = find_repeated_instructions(sessions)
    if repeated:
        lines.append("\n## Repeated Instructions (3+ sessions)")
        lines.append("\nPhrases appearing in first user message across multiple sessions:")
        lines.append("\n| Phrase | Sessions |")
        lines.append("|--------|----------|")
        for phrase, files in list(repeated.items())[:top_n]:
            lines.append(f"| `{phrase}` | {len(files)} |")

    # Chronological activity
    by_week = defaultdict(list)
    for s in sessions:
        week = datetime.fromtimestamp(s["mtime"], timezone.utc).strftime("%Y-W%U")
        by_week[week].append(s)

    lines.append("\n## Weekly Activity")
    lines.append("\n| Week | Sessions | Total MB | Top skill |")
    lines.append("|------|----------|----------|-----------|")
    for week in sorted(by_week.keys()):
        week_sessions = by_week[week]
        mb = sum(s["size"] for s in week_sessions) / 1024 / 1024
        week_skills = Counter()
        for s in week_sessions:
            for skill in s["skills_invoked"]:
                week_skills[skill] += 1
        top_skill = week_skills.most_common(1)[0][0] if week_skills else "—"
        lines.append(f"| {week} | {len(week_sessions)} | {mb:.0f} | `/{top_skill}` |")

    return "\n".join(lines)


def generate_corrections_detail(sessions):
    """Generate detailed correction report for memory file."""
    all_corrections = []
    for s in sessions:
        for c in s["corrections"]:
            all_corrections.append(c)

    lines = []
    lines.append("# Correction Patterns")
    lines.append(f"\n*Extracted from {len(sessions)} conversations*")
    lines.append(f"\n**Total corrections:** {len(all_corrections)}")

    # Group by type with full examples
    by_type = defaultdict(list)
    for c in all_corrections:
        by_type[c["label"]].append(c["text"])

    for label, examples in sorted(by_type.items(), key=lambda x: -len(x[1])):
        lines.append(f"\n## `{label}` ({len(examples)} occurrences)")
        for ex in examples[:5]:  # Top 5 examples per type
            clean = ex[:300].replace("\n", " ").strip()
            lines.append(f"\n> {clean}")

    return "\n".join(lines)


def main():
    args = parse_args()
    project_dir = args.project

    if not os.path.isdir(project_dir):
        print(f"Error: directory not found: {project_dir}", file=sys.stderr)
        sys.exit(1)

    jsonl_files = sorted(
        glob.glob(os.path.join(project_dir, "*.jsonl")),
        key=os.path.getmtime,
    )

    print(f"Parsing {len(jsonl_files)} conversations from {project_dir}...")

    sessions = []
    for i, filepath in enumerate(jsonl_files):
        if (i + 1) % 50 == 0:
            print(f"  ...{i + 1}/{len(jsonl_files)}")
        try:
            session = parse_conversation(filepath)
            sessions.append(session)
        except Exception as e:
            print(f"  Warning: failed to parse {filepath}: {e}", file=sys.stderr)

    print(f"Parsed {len(sessions)} conversations successfully.")

    if args.corrections_only:
        report = generate_corrections_detail(sessions)
    else:
        report = generate_report(sessions, top_n=args.top_n)

    output_path = args.output
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"Report written to {output_path}")

    # Also write corrections detail
    if not args.corrections_only:
        corrections_path = output_path.replace(".md", "-corrections.md")
        corrections_report = generate_corrections_detail(sessions)
        with open(corrections_path, "w", encoding="utf-8") as f:
            f.write(corrections_report)
        print(f"Corrections detail written to {corrections_path}")


if __name__ == "__main__":
    main()

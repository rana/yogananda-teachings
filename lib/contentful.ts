/**
 * Contentful utilities — Rich Text AST processing.
 *
 * Framework-agnostic (PRI-10). Used by the webhook handler
 * and the import script.
 *
 * Governing refs: ADR-010, DES-005
 */

// ── Rich Text AST Types ──────────────────────────────────────────

export interface RichTextNode {
  nodeType: string;
  value?: string;
  content?: RichTextNode[];
  data?: Record<string, unknown>;
  marks?: { type: string }[];
}

// ── Rich Text → Plain Text ───────────────────────────────────────

/** Extract plain text from a Contentful Rich Text AST document. */
export function richTextToPlainText(doc: RichTextNode): string {
  if (!doc || !doc.content) return "";

  const blocks: string[] = [];
  for (const node of doc.content) {
    const text = extractTextFromNode(node).trim();
    if (text) blocks.push(text);
  }
  return blocks.join("\n\n");
}

function extractTextFromNode(node: RichTextNode): string {
  if (node.nodeType === "text") return node.value || "";
  if (node.content) {
    return node.content.map(extractTextFromNode).join("");
  }
  return "";
}

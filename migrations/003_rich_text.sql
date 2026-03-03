-- migrate:up
-- Rich text fidelity: footnotes + formatting spans (PRI-01)
-- Footnotes: 530 across both books (248 en, 282 es), stored per chapter
-- Formatting: 3,919 spans (italic, bold, small-caps, superscript), stored per chunk

ALTER TABLE chapters ADD COLUMN footnotes JSONB NOT NULL DEFAULT '[]';
-- Array of {marker: string, text: string, pageNumber: number}

ALTER TABLE book_chunks ADD COLUMN formatting JSONB NOT NULL DEFAULT '[]';
-- Array of {start: number, end: number, style: string}
-- Styles: italic, bold, bold-italic, small-caps, superscript
-- Offsets are relative to the content string (adjusted for merged paragraphs)

-- migrate:down
ALTER TABLE chapters DROP COLUMN IF EXISTS footnotes;
ALTER TABLE book_chunks DROP COLUMN IF EXISTS formatting;

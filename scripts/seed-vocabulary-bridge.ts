/**
 * Vocabulary bridge seed — FTR-028 / FTR-029.
 *
 * Seeds vocabulary_bridge with modern-to-Yogananda term mappings.
 * Layer: 'vocabulary_expansion' — maps modern seeker vocabulary
 * to Yogananda's terminology from the Autobiography.
 *
 * These bridge entries power Scene 5 in the suggestion dropdown:
 * a seeker types "mindfulness" and sees "Yogananda's terms:
 * concentration, one-pointed attention, interiorization."
 *
 * Each mapping is corpus-verified: the yogananda_vocabulary terms
 * appear in the Autobiography's enriched topics or content.
 *
 * Usage:
 *   npx tsx scripts/seed-vocabulary-bridge.ts
 *
 * Requires: NEON_DATABASE_URL
 */

import pg from "pg";

interface BridgeEntry {
  expression: string;
  yogananda_vocabulary: string[];
  query_expansion: string[];
  register: string;
  crisis_adjacent: boolean;
  confidence: number;
  derivation_note: string;
}

const BRIDGE_ENTRIES: BridgeEntry[] = [
  // ── Core vocabulary gaps ──────────────────────────────
  {
    expression: "mindfulness",
    yogananda_vocabulary: ["concentration", "one-pointed attention", "interiorization"],
    query_expansion: ["concentration", "one-pointed attention", "interiorization", "meditation"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.95,
    derivation_note: "Modern mindfulness movement uses different terminology than Yogananda's raja yoga tradition.",
  },
  {
    expression: "anxiety",
    yogananda_vocabulary: ["restlessness", "mental restlessness", "nervous disturbance"],
    query_expansion: ["restlessness", "mental restlessness", "peace", "calmness"],
    register: "distressed",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Yogananda frames anxiety as restlessness of mind — a condition of the life force, not a clinical diagnosis.",
  },
  {
    expression: "depression",
    yogananda_vocabulary: ["melancholy", "delusion", "spiritual darkness", "despondency"],
    query_expansion: ["melancholy", "delusion", "joy", "overcoming sadness"],
    register: "distressed",
    crisis_adjacent: true,
    confidence: 0.85,
    derivation_note: "Bridge to Yogananda's framing while respecting the clinical reality. Crisis-adjacent: may indicate acute suffering.",
  },
  {
    expression: "stress",
    yogananda_vocabulary: ["tension", "mental disturbance", "restlessness", "nervousness"],
    query_expansion: ["tension", "peace", "relaxation", "calmness", "restlessness"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Modern stress maps to Yogananda's teaching on tension as misdirected life force.",
  },
  {
    expression: "enlightenment",
    yogananda_vocabulary: ["Self-realization", "God-realization", "cosmic consciousness", "liberation"],
    query_expansion: ["Self-realization", "God-realization", "cosmic consciousness", "samadhi"],
    register: "philosophical",
    crisis_adjacent: false,
    confidence: 0.95,
    derivation_note: "Yogananda uses specific SRF terminology for what popular culture calls enlightenment.",
  },
  {
    expression: "breathwork",
    yogananda_vocabulary: ["pranayama", "life force control", "prana"],
    query_expansion: ["pranayama", "life force", "prana", "breathing", "kriya yoga"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Modern breathwork movement draws from pranayama but uses different framing.",
  },
  {
    expression: "manifesting",
    yogananda_vocabulary: ["divine law", "creative visualization", "will power", "affirmation"],
    query_expansion: ["divine law", "will", "visualization", "affirmation", "prayer"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.8,
    derivation_note: "New Thought/LOA manifesting maps to Yogananda's teachings on will and divine law.",
  },
  {
    expression: "purpose",
    yogananda_vocabulary: ["dharma", "divine plan", "soul's purpose"],
    query_expansion: ["dharma", "divine plan", "purpose of life", "duty", "calling"],
    register: "philosophical",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Life purpose maps to Yogananda's dharma and soul calling teachings.",
  },
  {
    expression: "death",
    yogananda_vocabulary: ["transition", "afterlife", "astral world", "mahasamadhi"],
    query_expansion: ["death", "afterlife", "astral world", "reincarnation", "transition"],
    register: "distressed",
    crisis_adjacent: true,
    confidence: 0.9,
    derivation_note: "Death queries may indicate grief or existential distress. Yogananda frames death as transition.",
  },
  {
    expression: "suffering",
    yogananda_vocabulary: ["maya", "delusion", "karma", "pain"],
    query_expansion: ["maya", "delusion", "karma", "overcoming suffering", "liberation"],
    register: "distressed",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Yogananda frames suffering as the product of maya (cosmic illusion) and karma.",
  },
  {
    expression: "loneliness",
    yogananda_vocabulary: ["solitude", "aloneness with God", "divine communion"],
    query_expansion: ["solitude", "divine communion", "aloneness", "companionship of God"],
    register: "distressed",
    crisis_adjacent: false,
    confidence: 0.85,
    derivation_note: "Yogananda transforms loneliness into the gift of solitude with the Divine.",
  },
  {
    expression: "ego",
    yogananda_vocabulary: ["false self", "ahamkara", "pseudo-soul", "egoism"],
    query_expansion: ["ego", "ahamkara", "false self", "egoism", "humility"],
    register: "philosophical",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Yogananda uses ahamkara and pseudo-soul to describe what popular spirituality calls ego.",
  },
  {
    expression: "surrender",
    yogananda_vocabulary: ["divine surrender", "submission to God", "self-offering", "devotion"],
    query_expansion: ["surrender", "devotion", "submission to God", "divine will"],
    register: "devotional",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Surrender in Yogananda's teaching is active devotion, not passive resignation.",
  },
  {
    expression: "intuition",
    yogananda_vocabulary: ["soul guidance", "inner voice", "divine guidance", "soul perception"],
    query_expansion: ["intuition", "soul guidance", "inner voice", "divine guidance"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Yogananda teaches intuition as direct soul perception, not mere gut feeling.",
  },
  {
    expression: "gratitude",
    yogananda_vocabulary: ["thankfulness", "appreciation", "devotion", "divine gratitude"],
    query_expansion: ["gratitude", "thankfulness", "devotion", "appreciation"],
    register: "devotional",
    crisis_adjacent: false,
    confidence: 0.85,
    derivation_note: "Gratitude in Yogananda's teachings flows naturally from devotion and divine recognition.",
  },
  {
    expression: "forgiveness",
    yogananda_vocabulary: ["forgiveness", "divine love", "compassion", "letting go"],
    query_expansion: ["forgiveness", "divine love", "compassion", "mercy"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.85,
    derivation_note: "Yogananda teaches forgiveness as an expression of divine love, not mere psychological release.",
  },
  {
    expression: "addiction",
    yogananda_vocabulary: ["habit", "bad habit", "slavery of the senses", "will power"],
    query_expansion: ["habit", "will power", "self-control", "overcoming temptation"],
    register: "distressed",
    crisis_adjacent: true,
    confidence: 0.8,
    derivation_note: "Yogananda frames addictive patterns as habit-enslaved will. Crisis-adjacent: may indicate acute struggle.",
  },
  {
    expression: "trauma",
    yogananda_vocabulary: ["past impressions", "karma", "subconscious patterns", "healing"],
    query_expansion: ["karma", "healing", "past impressions", "overcoming the past"],
    register: "distressed",
    crisis_adjacent: true,
    confidence: 0.75,
    derivation_note: "Modern trauma framework maps loosely to Yogananda's karmic and subconscious pattern teachings.",
  },
  {
    expression: "self-care",
    yogananda_vocabulary: ["right living", "self-discipline", "balanced life", "health"],
    query_expansion: ["health", "right living", "balance", "self-discipline", "healing"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.8,
    derivation_note: "Self-care culture maps to Yogananda's practical teachings on balanced, disciplined living.",
  },
  {
    expression: "inner peace",
    yogananda_vocabulary: ["peace", "calmness", "stillness", "inner silence"],
    query_expansion: ["peace", "calmness", "stillness", "tranquility", "meditation"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.95,
    derivation_note: "Direct mapping. Yogananda's central promise: inner peace through meditation.",
  },
  {
    expression: "happiness",
    yogananda_vocabulary: ["joy", "bliss", "ananda", "ever-new joy"],
    query_expansion: ["joy", "bliss", "happiness", "ever-new joy", "ananda"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.95,
    derivation_note: "Yogananda distinguishes fleeting happiness from lasting joy (ananda) — the soul's nature.",
  },
  {
    expression: "love",
    yogananda_vocabulary: ["divine love", "unconditional love", "devotion", "bhakti"],
    query_expansion: ["divine love", "love", "devotion", "bhakti", "unconditional love"],
    register: "devotional",
    crisis_adjacent: false,
    confidence: 0.95,
    derivation_note: "Yogananda teaches love as divine love — not mere human sentiment but the soul's essence.",
  },
  {
    expression: "anger",
    yogananda_vocabulary: ["wrath", "emotional disturbance", "restlessness"],
    query_expansion: ["anger", "wrath", "emotional control", "peace", "calmness"],
    register: "distressed",
    crisis_adjacent: false,
    confidence: 0.85,
    derivation_note: "Yogananda addresses anger as a form of restlessness conquered by meditation and self-control.",
  },
  {
    expression: "fear",
    yogananda_vocabulary: ["fear", "courage", "fearlessness", "overcoming fear"],
    query_expansion: ["fear", "courage", "fearlessness", "overcoming fear", "bravery"],
    register: "distressed",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Direct mapping. Yogananda teaches fear as a product of body-identification.",
  },
  {
    expression: "meditation techniques",
    yogananda_vocabulary: ["meditation", "concentration", "kriya yoga", "yoga techniques"],
    query_expansion: ["meditation", "concentration", "kriya yoga", "how to meditate"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Seekers looking for techniques. Practice Bridge (FTR-055) routes to SRF Lessons information.",
  },
  {
    expression: "consciousness",
    yogananda_vocabulary: ["awareness", "Spirit", "cosmic consciousness", "superconsciousness"],
    query_expansion: ["consciousness", "cosmic consciousness", "awareness", "Spirit", "superconsciousness"],
    register: "philosophical",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Yogananda's consciousness hierarchy: subconsciousness, consciousness, superconsciousness, cosmic consciousness.",
  },
  {
    expression: "soul",
    yogananda_vocabulary: ["soul", "Self", "atman", "divine essence"],
    query_expansion: ["soul", "Self", "atman", "true self", "divine essence"],
    register: "philosophical",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Direct mapping. Yogananda teaches the soul (atman) as individualized Spirit.",
  },
  {
    expression: "God",
    yogananda_vocabulary: ["God", "Spirit", "Infinite", "Cosmic Consciousness", "Heavenly Father"],
    query_expansion: ["God", "Spirit", "Infinite", "divine", "Cosmic Consciousness"],
    register: "devotional",
    crisis_adjacent: false,
    confidence: 0.95,
    derivation_note: "Direct mapping with expanded vocabulary. Yogananda uses many names for the Divine.",
  },
  {
    expression: "reincarnation",
    yogananda_vocabulary: ["reincarnation", "rebirth", "past lives", "transmigration"],
    query_expansion: ["reincarnation", "rebirth", "past lives", "karma", "soul evolution"],
    register: "philosophical",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Direct mapping. Yogananda teaches reincarnation as the soul's evolutionary journey.",
  },
  {
    expression: "yoga",
    yogananda_vocabulary: ["yoga", "union", "divine union", "raja yoga"],
    query_expansion: ["yoga", "union", "meditation", "raja yoga", "kriya yoga"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.95,
    derivation_note: "Yogananda teaches yoga as union with God, not primarily as physical postures.",
  },
  {
    expression: "willpower",
    yogananda_vocabulary: ["will", "will power", "determination", "dynamic will"],
    query_expansion: ["will", "willpower", "determination", "self-discipline", "dynamic will"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Yogananda's will power teachings are central to his practical philosophy of self-mastery.",
  },
  {
    expression: "healing",
    yogananda_vocabulary: ["healing", "divine healing", "spiritual healing", "life force"],
    query_expansion: ["healing", "divine healing", "health", "life force", "prana"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.9,
    derivation_note: "Yogananda teaches healing through life force (prana) and divine attunement.",
  },
  {
    expression: "grief",
    yogananda_vocabulary: ["grief", "loss", "bereavement", "consolation"],
    query_expansion: ["grief", "loss", "death", "consolation", "comfort", "afterlife"],
    register: "distressed",
    crisis_adjacent: true,
    confidence: 0.85,
    derivation_note: "Grief queries indicate acute emotional state. Yogananda offers consolation through afterlife teachings.",
  },
  {
    expression: "relationship",
    yogananda_vocabulary: ["divine friendship", "soul mate", "human love", "attachment"],
    query_expansion: ["love", "friendship", "relationship", "attachment", "divine friendship"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.8,
    derivation_note: "Yogananda addresses human relationships through the lens of divine love and non-attachment.",
  },
  {
    expression: "wealth",
    yogananda_vocabulary: ["prosperity", "success", "material vs spiritual", "true wealth"],
    query_expansion: ["prosperity", "success", "wealth", "material", "spiritual wealth"],
    register: "functional",
    crisis_adjacent: false,
    confidence: 0.8,
    derivation_note: "Yogananda teaches prosperity consciousness while distinguishing material from spiritual wealth.",
  },
];

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL;
  if (!dbUrl) {
    console.error("NEON_DATABASE_URL not set.");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: dbUrl, max: 3 });

  console.log(`Seeding ${BRIDGE_ENTRIES.length} vocabulary bridge entries...`);

  let inserted = 0;
  let skipped = 0;

  for (const entry of BRIDGE_ENTRIES) {
    try {
      const result = await pool.query(
        `INSERT INTO vocabulary_bridge
          (layer, language, expression, yogananda_vocabulary, query_expansion,
           register, crisis_adjacent, confidence, derivation_note,
           generated_by, status)
        VALUES
          ('vocabulary_expansion', 'en', $1, $2, $3, $4, $5, $6, $7, 'editorial', 'active')
        ON CONFLICT DO NOTHING`,
        [
          entry.expression,
          entry.yogananda_vocabulary,
          entry.query_expansion,
          entry.register,
          entry.crisis_adjacent,
          entry.confidence,
          entry.derivation_note,
        ],
      );
      if (result.rowCount && result.rowCount > 0) {
        inserted++;
        console.log(`  + ${entry.expression} -> [${entry.yogananda_vocabulary.join(", ")}]`);
      } else {
        skipped++;
        console.log(`  = ${entry.expression} (already exists)`);
      }
    } catch (err) {
      console.error(`  ! ${entry.expression}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Verify
  const { rows } = await pool.query(
    "SELECT COUNT(*) as total FROM vocabulary_bridge WHERE layer = 'vocabulary_expansion'",
  );
  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}, Total in table: ${rows[0].total}`);

  await pool.end();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

/**
 * Entity registry seed — M1c-10 (FTR-033).
 *
 * Populates entity_registry and sanskrit_terms from domain knowledge.
 * Covers: teachers, divine names, techniques, Sanskrit terms, key concepts.
 *
 * Usage:
 *   npx tsx scripts/seed-entities.ts
 *
 * Requires: NEON_DATABASE_URL
 */

import pg from "pg";

interface Entity {
  canonical_name: string;
  entity_type: string;
  aliases: string[];
  definition: string;
}

const ENTITIES: Entity[] = [
  // Teachers (lineage of gurus)
  {
    canonical_name: "Paramahansa Yogananda",
    entity_type: "teacher",
    aliases: ["Yogananda", "Mukunda", "Mukunda Lal Ghosh"],
    definition: "Founder of Self-Realization Fellowship. Author of Autobiography of a Yogi.",
  },
  {
    canonical_name: "Sri Yukteswar Giri",
    entity_type: "teacher",
    aliases: ["Sri Yukteswar", "Yukteswar", "Priyanath Karar", "Swami Sri Yukteswar"],
    definition: "Guru of Paramahansa Yogananda. Author of The Holy Science.",
  },
  {
    canonical_name: "Lahiri Mahasaya",
    entity_type: "teacher",
    aliases: ["Lahiri", "Shyama Charan Lahiri", "Yogiraj"],
    definition: "Guru of Sri Yukteswar. Revived Kriya Yoga for the modern age.",
  },
  {
    canonical_name: "Mahavatar Babaji",
    entity_type: "teacher",
    aliases: ["Babaji", "Babaji-Krishna", "Mahavatar"],
    definition: "Deathless guru. Revived and transmitted Kriya Yoga to Lahiri Mahasaya.",
  },
  {
    canonical_name: "Swami Kebalananda",
    entity_type: "teacher",
    aliases: ["Kebalananda"],
    definition: "Sanskrit tutor of young Mukunda. Disciple of Lahiri Mahasaya.",
  },
  {
    canonical_name: "Master Mahasaya",
    entity_type: "teacher",
    aliases: ["Mahendra Nath Gupta", "M."],
    definition: "Author of The Gospel of Sri Ramakrishna. Mentioned in Autobiography.",
  },

  // SRF Presidents
  {
    canonical_name: "Rajarsi Janakananda",
    entity_type: "teacher",
    aliases: ["Rajarsi", "James J. Lynn", "Saint Lynn"],
    definition: "Foremost disciple of Yogananda. First successor as SRF president.",
  },
  {
    canonical_name: "Sri Daya Mata",
    entity_type: "teacher",
    aliases: ["Daya Mata", "Faye Wright"],
    definition: "Third SRF president. Direct disciple of Yogananda.",
  },
  {
    canonical_name: "Sri Mrinalini Mata",
    entity_type: "teacher",
    aliases: ["Mrinalini Mata", "Merna Brown"],
    definition: "Fourth SRF president. Direct disciple of Yogananda.",
  },

  // Historical figures
  {
    canonical_name: "Mahatma Gandhi",
    entity_type: "person",
    aliases: ["Gandhi", "Gandhiji"],
    definition: "Leader of Indian independence. Yogananda met him at Wardha ashram.",
  },
  {
    canonical_name: "Rabindranath Tagore",
    entity_type: "person",
    aliases: ["Tagore"],
    definition: "Nobel laureate poet. Yogananda visited his Shantiniketan school.",
  },
  {
    canonical_name: "Luther Burbank",
    entity_type: "person",
    aliases: ["Burbank"],
    definition: "American horticulturist. Friend of Yogananda, dedicated a chapter.",
  },
  {
    canonical_name: "Therese Neumann",
    entity_type: "person",
    aliases: ["Therese"],
    definition: "German Catholic mystic and stigmatist. Yogananda visited her.",
  },

  // Divine names
  {
    canonical_name: "Divine Mother",
    entity_type: "divine_name",
    aliases: ["Mother Divine", "Cosmic Mother", "Holy Mother"],
    definition: "The feminine aspect of God in Yogananda's devotional expression.",
  },
  {
    canonical_name: "God",
    entity_type: "divine_name",
    aliases: ["Spirit", "Infinite", "Cosmic Consciousness", "Heavenly Father"],
    definition: "The Supreme Being. Central to all of Yogananda's teachings.",
  },

  // Techniques and practices
  {
    canonical_name: "Kriya Yoga",
    entity_type: "technique",
    aliases: ["Kriya"],
    definition: "Advanced meditation technique in the SRF lineage. The central practice.",
  },
  {
    canonical_name: "Self-Realization",
    entity_type: "concept",
    aliases: ["Self-realization", "self realization"],
    definition: "Direct knowing of the Self (soul) as one with Spirit. The goal of yoga.",
  },

  // Places
  {
    canonical_name: "Ranchi",
    entity_type: "place",
    aliases: ["Ranchi school", "Yogoda school"],
    definition: "Location of Yogananda's school in Bihar, India. Founded 1918.",
  },
  {
    canonical_name: "Encinitas",
    entity_type: "place",
    aliases: ["Encinitas Hermitage", "SRF Encinitas"],
    definition: "Coastal California location of an SRF ashram established by Yogananda.",
  },
  {
    canonical_name: "Mount Washington",
    entity_type: "place",
    aliases: ["Mt. Washington", "SRF International Headquarters"],
    definition: "SRF international headquarters in Los Angeles.",
  },
];

interface SanskritTerm {
  canonical_form: string;
  display_form: string;
  devanagari?: string;
  iast_form?: string;
  common_variants: string[];
  srf_definition: string;
  domain: string;
  depth_level: number;
}

const SANSKRIT_TERMS: SanskritTerm[] = [
  {
    canonical_form: "yoga",
    display_form: "Yoga",
    devanagari: "योग",
    iast_form: "yoga",
    common_variants: [],
    srf_definition: "Union of the individual soul with Spirit. From Sanskrit root 'yuj' (to yoke).",
    domain: "practice",
    depth_level: 1,
  },
  {
    canonical_form: "kriya",
    display_form: "Kriya",
    devanagari: "क्रिया",
    iast_form: "kriyā",
    common_variants: ["kriyā"],
    srf_definition: "Rite, ceremony; sacred practice. In SRF context: Kriya Yoga meditation technique.",
    domain: "practice",
    depth_level: 2,
  },
  {
    canonical_form: "karma",
    display_form: "Karma",
    devanagari: "कर्म",
    iast_form: "karma",
    common_variants: [],
    srf_definition: "Action; the law of cause and effect in the moral sphere.",
    domain: "philosophy",
    depth_level: 1,
  },
  {
    canonical_form: "dharma",
    display_form: "Dharma",
    devanagari: "धर्म",
    iast_form: "dharma",
    common_variants: [],
    srf_definition: "Righteous duty; the inherent nature of a thing; cosmic law.",
    domain: "philosophy",
    depth_level: 1,
  },
  {
    canonical_form: "samadhi",
    display_form: "Samadhi",
    devanagari: "समाधि",
    iast_form: "samādhi",
    common_variants: ["samādhi"],
    srf_definition: "Superconscious state of union with God. The eighth limb of yoga.",
    domain: "practice",
    depth_level: 2,
  },
  {
    canonical_form: "prana",
    display_form: "Prana",
    devanagari: "प्राण",
    iast_form: "prāṇa",
    common_variants: ["prāṇa", "praan"],
    srf_definition: "Life force; vital energy that sustains the body.",
    domain: "philosophy",
    depth_level: 2,
  },
  {
    canonical_form: "maya",
    display_form: "Maya",
    devanagari: "माया",
    iast_form: "māyā",
    common_variants: ["māyā"],
    srf_definition: "Cosmic illusion; the veil that makes the One appear as many.",
    domain: "philosophy",
    depth_level: 2,
  },
  {
    canonical_form: "guru",
    display_form: "Guru",
    devanagari: "गुरु",
    iast_form: "guru",
    common_variants: [],
    srf_definition: "Spiritual teacher; one who leads from darkness to light.",
    domain: "lineage",
    depth_level: 1,
  },
  {
    canonical_form: "avatar",
    display_form: "Avatar",
    devanagari: "अवतार",
    iast_form: "avatāra",
    common_variants: ["avatāra", "avtar"],
    srf_definition: "Divine incarnation; a fully God-realized being who descends to earth.",
    domain: "lineage",
    depth_level: 2,
  },
  {
    canonical_form: "ashram",
    display_form: "Ashram",
    devanagari: "आश्रम",
    iast_form: "āśrama",
    common_variants: ["āśrama", "ashrama"],
    srf_definition: "Spiritual hermitage or monastery; a place of religious retreat.",
    domain: "place",
    depth_level: 1,
  },
  {
    canonical_form: "chakra",
    display_form: "Chakra",
    devanagari: "चक्र",
    iast_form: "cakra",
    common_variants: ["cakra"],
    srf_definition: "Wheel; center of spiritual energy in the astral spine.",
    domain: "practice",
    depth_level: 2,
  },
  {
    canonical_form: "mantra",
    display_form: "Mantra",
    devanagari: "मन्त्र",
    iast_form: "mantra",
    common_variants: [],
    srf_definition: "Sacred word or phrase used in meditation and devotion.",
    domain: "practice",
    depth_level: 1,
  },
];

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL;
  if (!dbUrl) {
    console.error("NEON_DATABASE_URL not set.");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: dbUrl, max: 3 });

  console.log("Entity Registry Seed — M1c-10\n");

  // Seed entities
  let entityCount = 0;
  for (const entity of ENTITIES) {
    try {
      await pool.query(
        `INSERT INTO entity_registry (canonical_name, entity_type, aliases, definition)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (canonical_name, entity_type) DO UPDATE
         SET aliases = EXCLUDED.aliases, definition = EXCLUDED.definition`,
        [entity.canonical_name, entity.entity_type, entity.aliases, entity.definition],
      );
      entityCount++;
    } catch (err) {
      console.error(`  Error seeding ${entity.canonical_name}:`, err);
    }
  }
  console.log(`Entities: ${entityCount}/${ENTITIES.length} seeded`);

  // Seed Sanskrit terms
  let termCount = 0;
  for (const term of SANSKRIT_TERMS) {
    try {
      await pool.query(
        `INSERT INTO sanskrit_terms (canonical_form, display_form, devanagari, iast_form, common_variants, srf_definition, domain, depth_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [
          term.canonical_form,
          term.display_form,
          term.devanagari || null,
          term.iast_form || null,
          term.common_variants,
          term.srf_definition,
          term.domain,
          term.depth_level,
        ],
      );
      termCount++;
    } catch (err) {
      console.error(`  Error seeding ${term.canonical_form}:`, err);
    }
  }
  console.log(`Sanskrit terms: ${termCount}/${SANSKRIT_TERMS.length} seeded`);

  // Verify
  const { rows: entityRows } = await pool.query("SELECT COUNT(*) FROM entity_registry");
  const { rows: termRows } = await pool.query("SELECT COUNT(*) FROM sanskrit_terms");
  console.log(`\nVerification: ${entityRows[0].count} entities, ${termRows[0].count} Sanskrit terms in database`);

  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

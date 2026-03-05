/**
 * Contentful schema migration: greenfield content model
 *
 * Ensures the Contentful content types have all fields needed by
 * the greenfield data model:
 *
 *   Chapter  → rasa, epigraph, epigraphAttribution
 *   TextBlock → contentType
 *   BookFigure (new) → photo/illustration linking
 *
 * Safe to run multiple times — checks for existing fields/types.
 *
 * Usage:
 *   npx tsx scripts/ingest/migrate-contentful-schema.ts [--dry-run]
 *
 * Requires: CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN
 */

import contentful from "contentful-management";

const CONTENTFUL_ENVIRONMENT = "master";
const VALID_RASAS = ["shanta", "adbhuta", "karuna", "vira", "bhakti"];
const VALID_CONTENT_TYPES = [
  "prose",
  "verse",
  "epigraph",
  "caption",
  "dialogue",
];

/** Add a field to a content type if it doesn't already exist */
function addFieldIfMissing(
  ct: contentful.ContentType,
  field: contentful.ContentTypeFieldInput,
): boolean {
  if (ct.fields.some((f) => f.id === field.id)) return false;
  ct.fields.push(field);
  return true;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !managementToken) {
    console.error(
      "CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set.",
    );
    process.exit(1);
  }

  console.log(`Contentful Schema Migration${dryRun ? " (dry run)" : ""}`);
  console.log(`  Space: ${spaceId}`);
  console.log(`  Environment: ${CONTENTFUL_ENVIRONMENT}\n`);

  const client = contentful.createClient({ accessToken: managementToken });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(CONTENTFUL_ENVIRONMENT);

  // ── 1. Chapter: add rasa, epigraph, epigraphAttribution ─────────

  console.log("1. Chapter fields");
  const chapterType = await environment.getContentType("chapter");
  const chapterAdded: string[] = [];

  if (
    addFieldIfMissing(chapterType, {
      id: "rasa",
      name: "Rasa",
      type: "Symbol",
      required: false,
      localized: false,
      validations: [
        {
          in: VALID_RASAS,
          message: `Rasa must be one of: ${VALID_RASAS.join(", ")}`,
        },
      ],
    })
  )
    chapterAdded.push("rasa");

  if (
    addFieldIfMissing(chapterType, {
      id: "epigraph",
      name: "Epigraph",
      type: "Text",
      required: false,
      localized: true,
    })
  )
    chapterAdded.push("epigraph");

  if (
    addFieldIfMissing(chapterType, {
      id: "epigraphAttribution",
      name: "Epigraph Attribution",
      type: "Symbol",
      required: false,
      localized: true,
    })
  )
    chapterAdded.push("epigraphAttribution");

  if (chapterAdded.length === 0) {
    console.log("   All fields exist. Skipping.\n");
  } else {
    console.log(`   Adding: ${chapterAdded.join(", ")}`);
    if (!dryRun) {
      const updated = await chapterType.update();
      await updated.publish();
      console.log("   Published.\n");
    } else {
      console.log("   (dry run)\n");
    }
  }

  // ── 2. TextBlock: add contentType ───────────────────────────────

  console.log("2. TextBlock → contentType field");
  const textBlockType = await environment.getContentType("textBlock");
  const tbAdded = addFieldIfMissing(textBlockType, {
    id: "contentType",
    name: "Content Type",
    type: "Symbol",
    required: false,
    localized: false,
    validations: [
      {
        in: VALID_CONTENT_TYPES,
        message: `Content type must be one of: ${VALID_CONTENT_TYPES.join(", ")}`,
      },
    ],
  });

  if (!tbAdded) {
    console.log("   Already exists. Skipping.\n");
  } else {
    console.log(
      `   Adding contentType (Symbol, validated: ${VALID_CONTENT_TYPES.join(", ")})`,
    );
    if (!dryRun) {
      const updated = await textBlockType.update();
      await updated.publish();
      console.log("   Published.\n");
    } else {
      console.log("   (dry run)\n");
    }
  }

  // ── 3. Create BookFigure content type ───────────────────────────

  console.log("3. BookFigure content type");
  let bookFigureExists = false;
  try {
    await environment.getContentType("bookFigure");
    bookFigureExists = true;
  } catch {
    // Doesn't exist — we'll create it
  }

  if (bookFigureExists) {
    console.log("   Already exists. Skipping.\n");
  } else {
    console.log("   Creating bookFigure content type...");
    if (!dryRun) {
      const bookFigure = await environment.createContentTypeWithId(
        "bookFigure",
        {
          name: "BookFigure",
          description:
            "A photograph or illustration from a published book. Links to a Contentful Asset and the chapter it appears in.",
          displayField: "caption",
          fields: [
            {
              id: "caption",
              name: "Caption",
              type: "Symbol",
              required: true,
              localized: true,
            },
            {
              id: "altText",
              name: "Alt Text",
              type: "Symbol",
              required: true,
              localized: true,
              validations: [{ size: { min: 10, max: 500 } }],
            },
            {
              id: "image",
              name: "Image",
              type: "Link",
              linkType: "Asset",
              required: true,
              localized: false,
              validations: [{ linkMimetypeGroup: ["image"] }],
            },
            {
              id: "chapter",
              name: "Chapter",
              type: "Link",
              linkType: "Entry",
              required: true,
              localized: false,
              validations: [{ linkContentType: ["chapter"] }],
            },
            {
              id: "pageNumber",
              name: "Page Number",
              type: "Integer",
              required: false,
              localized: false,
            },
            {
              id: "sortOrder",
              name: "Sort Order",
              type: "Integer",
              required: true,
              localized: false,
              validations: [{ range: { min: 1 } }],
            },
            {
              id: "figureType",
              name: "Figure Type",
              type: "Symbol",
              required: false,
              localized: false,
              validations: [
                {
                  in: ["photograph", "illustration", "diagram"],
                  message:
                    "Figure type must be photograph, illustration, or diagram",
                },
              ],
            },
          ],
        },
      );
      await bookFigure.publish();
      console.log("   Published.\n");
    } else {
      console.log("   Would create: bookFigure with 7 fields\n");
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Schema migration failed:", err);
  process.exit(1);
});

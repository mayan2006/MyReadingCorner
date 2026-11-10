/**
 * מייבא יצירות פרוזה עבריות בנחלת הכלל מ-"פרויקט בן־יהודה" אל books בסטטוס pending.
 * המקור: https://github.com/projectbenyehuda/public_domain_dump
 *
 * הספרים לא מופיעים בקטלוג עד שמנהלת משייכת קטגוריה ב-/manager/books.
 *
 * הרצה מתיקיית Server:
 *   node scripts/importBenYehuda.js --dry --limit=3
 *   npm run import:benyehuda
 *   npm run import:benyehuda -- --dry --limit=3
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("../Models/BookModel");
const { parseCsv, cleanText, makeSummary } = require("../utils/benYehudaCsv");
const {
  IMPORT_SOURCE,
  PENDING_CATEGORY_CODE,
  PLACEHOLDER_COVER,
  IMPORT_STATUSES
} = require("../utils/catalogVisibility");

const RAW = "https://raw.githubusercontent.com/projectbenyehuda/public_domain_dump/master";
const CATALOGUE_URL = `${RAW}/pseudocatalogue.csv`;
const DELAY_MS = 400;
const DEFAULT_LIMIT = 50;

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...rest] = a.replace(/^--/, "").split("=");
    return [k, rest.length ? rest.join("=") : true];
  })
);
const LIMIT = Number(args.limit) || DEFAULT_LIMIT;
const GENRE = args.genre || "prose";
const MIN_CHARS = Number(args["min-chars"]) || 15_000;
const TEXT_DIR = args.nikkud ? "txt" : "txt_stripped";
const DRY = Boolean(args.dry);
const SHUFFLE = Boolean(args.shuffle);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "MyReadingCorner-importer/1.0" }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i === retries) throw err;
      await sleep(DELAY_MS * i * 2);
    }
  }
}

async function main() {
  console.log("מוריד את הקטלוג של בן־יהודה...");
  const catalogue = parseCsv(await fetchText(CATALOGUE_URL));
  let candidates = catalogue.filter((r) => String(r.genre || "").endsWith(`.${GENRE}`));
  console.log(`נמצאו ${candidates.length} יצירות בז'אנר "${GENRE}" (מתוך ${catalogue.length})`);

  if (SHUFFLE) candidates = candidates.sort(() => Math.random() - 0.5);

  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/mySiteDB";
  if (!DRY) {
    await mongoose.connect(uri);
  } else {
    console.log("(מצב dry: אין חיבור ל-DB ולא נכתב כלום)");
  }

  let imported = 0;
  let scanned = 0;
  for (const row of candidates) {
    if (imported >= LIMIT) break;
    scanned++;
    const externalId = String(row.ID || "").trim();
    if (!externalId) continue;

    if (!DRY) {
      const existing = await Book.findOne({ source: IMPORT_SOURCE, externalId }).select("_id").lean();
      if (existing) continue;
    }

    try {
      const url = `${RAW}/${TEXT_DIR}${row.path}.txt`;
      const raw = await fetchText(url);
      await sleep(DELAY_MS);
      const content = cleanText(raw, row.title);
      if (content.length < MIN_CHARS) continue;

      const title = String(row.title || "").trim();
      const author = String(row.authors || "").trim() || "לא ידוע";
      const doc = {
        bookCode: `BY-${externalId}`,
        categoryCode: PENDING_CATEGORY_CODE,
        title,
        author,
        summary: makeSummary(content, row),
        img: PLACEHOLDER_COVER,
        content,
        source: IMPORT_SOURCE,
        externalId,
        language: "he",
        sourceCredit: "פרויקט בן־יהודה — https://benyehuda.org",
        importedAt: new Date(),
        importStatus: IMPORT_STATUSES.pending
      };

      if (DRY) {
        console.log(`  [dry] ${doc.title} — ${doc.author} (${content.length} תווים)`);
      } else {
        await Book.create(doc);
        console.log(`  ✓ ממתין לאישור: ${doc.title} — ${doc.author} (${doc.bookCode})`);
      }
      imported++;
    } catch (err) {
      console.error(`  ✗ "${row.title}" (ID ${externalId}): ${err.message}`);
    }
  }

  console.log(`\nסיום. נסרקו ${scanned}, יובאו ${imported} (limit=${LIMIT}, סטטוס=pending).`);
}

main()
  .catch((err) => {
    console.error("הסקריפט נכשל:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  });

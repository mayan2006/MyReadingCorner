/** פרסר CSV קטן (RFC 4180): תומך בשדות במירכאות, מירכאות כפולות ושורות מרובות. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...data] = rows;
  if (!header) return [];
  return data
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

const MAX_CONTENT_CHARS = 1_000_000;
const SUMMARY_CHARS = 250;

function cleanText(raw, title) {
  let text = String(raw || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  if (title && lines[0] && lines[0].trim() === String(title).trim()) lines.shift();
  text = lines
    .join("\n")
    .replace(/^[\s\t]+/, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (text.length > MAX_CONTENT_CHARS) {
    const cut = text.lastIndexOf("\n\n", MAX_CONTENT_CHARS);
    text =
      text.slice(0, cut > 0 ? cut : MAX_CONTENT_CHARS) +
      "\n\n[... המשך היצירה קוצר ...]";
  }
  return text;
}

function makeSummary(text, row = {}) {
  const firstPara = String(text || "")
    .split("\n\n")
    .find((p) => p.trim().length > 40) || text;
  let s = String(firstPara || "")
    .replace(/\s+/g, " ")
    .trim();
  if (s.length > SUMMARY_CHARS) {
    const cut = s.lastIndexOf(" ", SUMMARY_CHARS);
    s = s.slice(0, cut > 0 ? cut : SUMMARY_CHARS) + "…";
  }
  if (row.translators) s += ` (תרגום: ${row.translators})`;
  return s || "יצירה מפרויקט בן־יהודה.";
}

module.exports = {
  parseCsv,
  cleanText,
  makeSummary,
  MAX_CONTENT_CHARS,
  SUMMARY_CHARS
};

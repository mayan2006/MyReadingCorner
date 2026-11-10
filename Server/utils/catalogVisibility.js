const IMPORT_SOURCE = "benyehuda";
const PENDING_CATEGORY_CODE = "CAT-PENDING";
const PLACEHOLDER_COVER = "https://placehold.co/400x600?text=Ben-Yehuda";
const IMPORT_ASSIGN_CATEGORIES = ["פנטזיה", "רומנטיקה", "מתח", "נוער"];
const IMPORT_STATUSES = {
  pending: "pending",
  published: "published",
  rejected: "rejected"
};

/** ספרים ישנים בלי importStatus נשארים גלויים. pending/rejected לא בקטלוג. */
const publicBookFilter = () => ({
  $nor: [
    { importStatus: IMPORT_STATUSES.pending },
    { importStatus: IMPORT_STATUSES.rejected }
  ]
});

const isPublicBook = (book) => {
  const status = book?.importStatus;
  return status !== IMPORT_STATUSES.pending && status !== IMPORT_STATUSES.rejected;
};

const isAssignableCategory = (value) =>
  IMPORT_ASSIGN_CATEGORIES.includes(String(value || "").trim());

module.exports = {
  IMPORT_SOURCE,
  PENDING_CATEGORY_CODE,
  PLACEHOLDER_COVER,
  IMPORT_ASSIGN_CATEGORIES,
  IMPORT_STATUSES,
  publicBookFilter,
  isPublicBook,
  isAssignableCategory
};

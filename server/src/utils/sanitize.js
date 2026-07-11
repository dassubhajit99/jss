import sanitizeHtml from "sanitize-html";

// Shared sanitize-html config for any HTML stored in the DB (Page.bodyHtml).
// Used both by the seed script (markdown -> HTML) and the admin Pages
// controller (TipTap -> HTML) so both paths are sanitized identically.
export function sanitizeBodyHtml(html = "") {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "h3", "img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt"],
      a: ["href", "name", "target", "rel"],
    },
  });
}

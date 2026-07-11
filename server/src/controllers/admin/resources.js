import {
  Page,
  CommitteeMember,
  DurgaPuja,
  GalleryAlbum,
  Service,
  PressItem,
} from "../../models/index.js";
import { sanitizeBodyHtml } from "../../utils/sanitize.js";
import { makeCrud } from "./crud.js";

export const pagesCrud = makeCrud(Page, {
  sort: { order: 1, slug: 1 },
  beforeSave: (d) =>
    d.bodyHtml !== undefined ? { ...d, bodyHtml: sanitizeBodyHtml(d.bodyHtml) } : d,
});

export const committeeCrud = makeCrud(CommitteeMember, {
  sort: { isExecutive: 1, order: 1 },
});

export const durgaPujaCrud = makeCrud(DurgaPuja, {
  sort: { year: -1 },
});

export const galleryCrud = makeCrud(GalleryAlbum, {
  sort: { order: 1, year: -1 },
});

export const servicesCrud = makeCrud(Service, {
  sort: { order: 1 },
});

export const pressCrud = makeCrud(PressItem, {
  sort: { date: -1 },
});

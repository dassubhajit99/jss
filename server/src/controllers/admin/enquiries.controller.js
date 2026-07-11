import { Enquiry } from "../../models/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.handled === "true") filter.handled = true;
  if (req.query.handled === "false") filter.handled = false;

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const [docs, total] = await Promise.all([
    Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Enquiry.countDocuments(filter),
  ]);

  res.json({
    data: docs,
    meta: { total, page, pages: Math.max(1, Math.ceil(total / limit)) },
  });
});

export const setHandled = asyncHandler(async (req, res) => {
  const doc = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { handled: req.body.handled },
    { new: true }
  );
  if (!doc) throw ApiError.notFound("Not found");
  res.json({ data: doc });
});

export const remove = asyncHandler(async (req, res) => {
  const doc = await Enquiry.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound("Not found");
  res.json({ data: { deleted: true } });
});

import { SiteSetting } from "../../models/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const get = asyncHandler(async (req, res) => {
  const doc = await SiteSetting.findOne({ key: "global" }).lean();
  res.json({ data: doc || {} });
});

export const update = asyncHandler(async (req, res) => {
  const { key, ...body } = req.body; // key is never client-controlled
  const doc = await SiteSetting.findOneAndUpdate(
    { key: "global" },
    { $set: body },
    { new: true, upsert: true }
  );
  res.json({ data: doc });
});

import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Generic CRUD factory shared by every simple admin resource (Pages,
// Committee, Durga Puja, Gallery, Services, Press). Keeps route handlers
// DRY while still letting each resource supply its own sort order and an
// optional beforeSave hook (e.g. sanitizing bodyHtml).
export function makeCrud(Model, { sort = { order: 1, createdAt: -1 }, beforeSave } = {}) {
  const list = asyncHandler(async (req, res) => {
    const docs = await Model.find({}).sort(sort).lean();
    res.json({ data: docs });
  });

  const get = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id).lean();
    if (!doc) throw ApiError.notFound("Not found");
    res.json({ data: doc });
  });

  const create = asyncHandler(async (req, res) => {
    const data = beforeSave ? await beforeSave(req.body) : req.body;
    const doc = await Model.create(data);
    res.status(201).json({ data: doc });
  });

  const update = asyncHandler(async (req, res) => {
    const data = beforeSave ? await beforeSave(req.body) : req.body;
    const doc = await Model.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw ApiError.notFound("Not found");
    res.json({ data: doc });
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw ApiError.notFound("Not found");
    res.json({ data: { deleted: true } });
  });

  const reorder = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    await Model.bulkWrite(
      ids.map((id, i) => ({
        updateOne: { filter: { _id: id }, update: { order: i } },
      }))
    );
    res.json({ data: { ok: true } });
  });

  return { list, get, create, update, remove, reorder };
}

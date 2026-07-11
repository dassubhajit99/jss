import {
  Page,
  CommitteeMember,
  DurgaPuja,
  GalleryAlbum,
  Service,
  PressItem,
  Enquiry,
} from "../../models/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const dashboard = asyncHandler(async (req, res) => {
  const [pages, committee, durgaPuja, gallery, services, press, enquiries, unhandledEnquiries] =
    await Promise.all([
      Page.countDocuments(),
      CommitteeMember.countDocuments(),
      DurgaPuja.countDocuments(),
      GalleryAlbum.countDocuments(),
      Service.countDocuments(),
      PressItem.countDocuments(),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ handled: false }),
    ]);

  res.json({
    data: { pages, committee, durgaPuja, gallery, services, press, enquiries, unhandledEnquiries },
  });
});

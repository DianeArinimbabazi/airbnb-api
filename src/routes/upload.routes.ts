import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import upload from "../config/multer";
import {
  uploadAvatar,
  deleteAvatar,
  uploadListingPhotos,
  deleteListingPhoto,
} from "../controllers/upload.controller";

const router = Router();

router.post("/:id/avatar", authenticate, upload.single("image"), uploadAvatar);
router.delete("/:id/avatar", authenticate, deleteAvatar);

export { router as userUploadRouter };

const listingRouter = Router();

listingRouter.post("/:id/photos", authenticate, upload.array("photos", 5), uploadListingPhotos);
listingRouter.delete("/:id/photos/:photoId", authenticate, deleteListingPhoto);

export { listingRouter as listingUploadRouter };
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

router.post("/:id/avatar", authenticate, (req: any, res: any, next: any) => {
  console.log("Content-Type:", req.headers["content-type"]);
  next();
}, upload.single("avatar"), uploadAvatar);


export { router as userUploadRouter };

const listingRouter = Router();

listingRouter.post("/:id/photos", authenticate, upload.array("photos", 5), uploadListingPhotos);
listingRouter.delete("/:id/photos/:photoId", authenticate, deleteListingPhoto);

export { listingRouter as listingUploadRouter };
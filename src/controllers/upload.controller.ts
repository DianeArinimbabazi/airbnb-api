import { Response } from "express";
import prisma from "../config/prisma";
import { uploadToCloudinary, deleteFromCloudinary, getOptimizedUrl } from "../config/cloudinary";
import type { AuthRequest } from "../middlewares/auth.middleware";

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (req.userId !== id) return res.status(403).json({ error: "Forbidden" });
    const reqFile = req.file || (req.files as any)?.[0];
    if (!reqFile) return res.status(400).json({ error: "No file uploaded" });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.avatarPublicId) await deleteFromCloudinary(user.avatarPublicId);

    const { url, publicId } = await uploadToCloudinary(reqFile.buffer, "airbnb/avatars");

    const updated = await prisma.user.update({
      where: { id },
      data: { avatar: url, avatarPublicId: publicId },
    });

    const { password: _, ...safeUser } = updated;
    return res.json(safeUser);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (req.userId !== id) return res.status(403).json({ error: "Forbidden" });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.avatar) return res.status(400).json({ error: "No avatar to remove" });

    await deleteFromCloudinary(user.avatarPublicId!);
    await prisma.user.update({
      where: { id },
      data: { avatar: null, avatarPublicId: null },
    });

    return res.json({ message: "Avatar removed successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const uploadListingPhotos = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { photos: true },
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.hostId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    const existingCount = await prisma.listingPhoto.count({ where: { listingId: id } });
    if (existingCount >= 5) return res.status(400).json({ error: "Maximum of 5 photos allowed per listing" });

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ error: "No files uploaded" });

    const toProcess = files.slice(0, 5 - existingCount);

    for (const file of toProcess) {
      const { url, publicId } = await uploadToCloudinary(file.buffer, "airbnb/listings");
      await prisma.listingPhoto.create({ data: { url, publicId, listingId: id } });
    }

    const updated = await prisma.listing.findUnique({
      where: { id },
      include: { photos: true },
    });

    return res.status(201).json({
      ...updated,
      photos: updated!.photos.map((p) => ({ ...p, url: getOptimizedUrl(p.url, 800, 600) })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteListingPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string; const photoId = req.params.photoId as string;

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.hostId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    const photo = await prisma.listingPhoto.findUnique({ where: { id: photoId } });
    if (!photo) return res.status(404).json({ error: "Photo not found" });
    if (photo.listingId !== id) return res.status(403).json({ error: "Photo does not belong to this listing" });

    await deleteFromCloudinary(photo.publicId);
    await prisma.listingPhoto.delete({ where: { id: photoId } });

    return res.json({ message: "Photo deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};


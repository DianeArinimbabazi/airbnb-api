import { Request, Response } from "express";
import prisma from "../config/prisma";
import { uploadToCloudinary, deleteFromCloudinary, getOptimizedUrl } from "../config/cloudinary";

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (req.userId !== Number(id)) return res.status(403).json({ error: "Forbidden" });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.avatarPublicId) await deleteFromCloudinary(user.avatarPublicId);

    const { url, publicId } = await uploadToCloudinary(req.file.buffer, "airbnb/avatars");

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { avatar: url, avatarPublicId: publicId },
    });

    const { password: _, ...safeUser } = updated;
    return res.json(safeUser);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (req.userId !== Number(id)) return res.status(403).json({ error: "Forbidden" });

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.avatar) return res.status(400).json({ error: "No avatar to remove" });

    await deleteFromCloudinary(user.avatarPublicId!);
    await prisma.user.update({
      where: { id: Number(id) },
      data: { avatar: null, avatarPublicId: null },
    });

    return res.json({ message: "Avatar removed successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const uploadListingPhotos = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({ where: { id: Number(id) } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.hostId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    const existingCount = await prisma.listingPhoto.count({ where: { listingId: Number(id) } });
    if (existingCount >= 5) return res.status(400).json({ error: "Maximum of 5 photos allowed per listing" });

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ error: "No files uploaded" });

    const toProcess = files.slice(0, 5 - existingCount);

    for (const file of toProcess) {
      const { url, publicId } = await uploadToCloudinary(file.buffer, "airbnb/listings");
      await prisma.listingPhoto.create({ data: { url, publicId, listingId: Number(id) } });
    }

    const updated = await prisma.listing.findUnique({
      where: { id: Number(id) },
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

export const deleteListingPhoto = async (req: Request, res: Response) => {
  try {
    const { id, photoId } = req.params;

    const listing = await prisma.listing.findUnique({ where: { id: Number(id) } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.hostId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    const photo = await prisma.listingPhoto.findUnique({ where: { id: Number(photoId) } });
    if (!photo) return res.status(404).json({ error: "Photo not found" });
    if (photo.listingId !== Number(id)) return res.status(403).json({ error: "Photo does not belong to this listing" });

    await deleteFromCloudinary(photo.publicId);
    await prisma.listingPhoto.delete({ where: { id: Number(photoId) } });

    return res.json({ message: "Photo deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
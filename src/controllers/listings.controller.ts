import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

/* =========================
   GET ALL LISTINGS
========================= */
export const getAllListings = async (req: Request, res: Response) => {
  try {
    const { location, type, maxPrice, page, limit, sortBy, order } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const listings = await prisma.listing.findMany({
      where: {
        ...(location && { location: { contains: String(location), mode: "insensitive" } }),
        ...(type && { type: type as any }),
        ...(maxPrice && { pricePerNight: { lte: Number(maxPrice) } }),
      },
      include: {
        host: { select: { name: true, avatar: true } },
      },
      skip,
      take: limitNum,
      orderBy: sortBy ? { [String(sortBy)]: order || "asc" } : { createdAt: "desc" },
    });

    res.json(listings);
  } catch {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};

/* =========================
   GET LISTING BY ID
========================= */
export const getListingById = async (req: Request, res: Response) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: Number(req.params.id) },
      include: { host: true, bookings: true },
    });

    if (!listing) return res.status(404).json({ error: "Listing not found" });

    res.json(listing);
  } catch {
    res.status(500).json({ error: "Failed to fetch listing" });
  }
};

/* =========================
   CREATE LISTING
========================= */
export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, pricePerNight, guests, type, amenities } = req.body;

    if (!title || !description || !location || !pricePerNight || !guests || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const allowedTypes = ["APARTMENT", "HOUSE", "VILLA", "CABIN"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid listing type" });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        location,
        pricePerNight: Number(pricePerNight),
        guests: Number(guests),
        type,
        amenities: Array.isArray(amenities) ? amenities.join(", ") : amenities || "",
        hostId: req.userId!,
        rating: 0,
      },
    });

    res.status(201).json(listing);
  } catch {
    res.status(500).json({ error: "Failed to create listing" });
  }
};

/* =========================
   UPDATE LISTING
========================= */
export const updateListing = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (listing.hostId !== req.userId && req.role !== "ADMIN") {
      return res.status(403).json({ error: "You can only edit your own listings" });
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: { ...req.body },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update listing" });
  }
};

/* =========================
   DELETE LISTING
========================= */
export const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (listing.hostId !== req.userId && req.role !== "ADMIN") {
      return res.status(403).json({ error: "You can only delete your own listings" });
    }

    await prisma.listing.delete({ where: { id } });

    res.json({ message: "Listing deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete listing" });
  }
};

/* =========================
   SEARCH LISTINGS
========================= */
export const searchListings = async (req: Request, res: Response) => {
  try {
    const { location, type, minPrice, maxPrice, guests, page, limit } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(location && { location: { contains: String(location), mode: "insensitive" as const } }),
      ...(type && { type: type as any }),
      ...(guests && { guests: { gte: Number(guests) } }),
      ...((minPrice || maxPrice) && {
        pricePerNight: {
          ...(minPrice && { gte: Number(minPrice) }),
          ...(maxPrice && { lte: Number(maxPrice) }),
        },
      }),
    };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { host: { select: { name: true, avatar: true } } },
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      data: listings,
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch {
    res.status(500).json({ error: "Failed to search listings" });
  }
};

/* =========================
   GET LISTING STATS
========================= */
export const getListingStats = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.$queryRaw`
      SELECT
        location,
        COUNT(*)::int AS total,
        ROUND(AVG("pricePerNight")::numeric, 2) AS avg_price,
        MIN("pricePerNight") AS min_price,
        MAX("pricePerNight") AS max_price
      FROM "Listing"
      GROUP BY location
      ORDER BY total DESC
    `;
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
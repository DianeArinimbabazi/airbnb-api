import { Request, Response } from "express";
import prisma from "../config/prisma";
import { getCache, setCache, clearCache, clearCacheByPrefix } from "../config/cache";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getAllListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const cacheKey = `listings:list:${page}:${limit}`;
    const cached = getCache(cacheKey);
    if (cached) { res.json(cached); return; }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        skip, take: limit,
        orderBy: { createdAt: "desc" },
        include: { host: { select: { name: true, avatar: true } } },
      }),
      prisma.listing.count(),
    ]);

    const result = {
      data: listings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    setCache(cacheKey, result, 60);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { location, type, minPrice, maxPrice, guests } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (location) where.location = { contains: location as string, mode: "insensitive" };
    if (type) where.type = type as string;
    if (guests) where.guests = { gte: parseInt(guests as string) };
    if (minPrice || maxPrice) {
      where.pricePerNight = {
        ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {}),
      };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: "desc" },
        include: { host: { select: { name: true, avatar: true } } },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      data: listings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getListingStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = "listings:stats";
    const cached = getCache(cacheKey);
    if (cached) { res.json(cached); return; }

    const [totalListings, avgResult, byLocation, byType] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.aggregate({ _avg: { pricePerNight: true } }),
      prisma.listing.groupBy({ by: ["location"], _count: { location: true } }),
      prisma.listing.groupBy({ by: ["type"], _count: { type: true } }),
    ]);

    const result = {
      totalListings,
      averagePrice: avgResult._avg.pricePerNight ?? 0,
      byLocation,
      byType,
    };

    setCache(cacheKey, result, 5 * 60);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getListingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        host: { select: { name: true, avatar: true } },
        reviews: { include: { user: { select: { name: true, avatar: true } } } },
      },
    });
    if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }
    res.json(listing);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, location, pricePerNight, guests, type, amenities } = req.body;

    if (!title || !description || !location || !pricePerNight || !guests || !type) {
      res.status(400).json({ error: "All required fields must be provided" });
      return;
    }

    const listing = await prisma.listing.create({
      data: {
        title, description, location,
        pricePerNight: Number(pricePerNight),
        guests: Number(guests),
        type,
        amenities: Array.isArray(amenities) ? amenities.join(", ") : amenities || "",
        hostId: req.userId!,
        rating: 0,
      },
    });

    clearCacheByPrefix("listings:list");
    clearCache("listings:stats");
    res.status(201).json(listing);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: "Listing not found" }); return; }

    if (existing.hostId !== req.userId && req.role !== "ADMIN") {
      res.status(403).json({ error: "You can only edit your own listings" });
      return;
    }

    const listing = await prisma.listing.update({ where: { id }, data: req.body });
    clearCacheByPrefix("listings:list");
    clearCache("listings:stats");
    res.json(listing);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: "Listing not found" }); return; }

    if (existing.hostId !== req.userId && req.role !== "ADMIN") {
      res.status(403).json({ error: "You can only delete your own listings" });
      return;
    }

    await prisma.listing.delete({ where: { id } });
    clearCacheByPrefix("listings:list");
    clearCache("listings:stats");
    res.json({ message: "Listing deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
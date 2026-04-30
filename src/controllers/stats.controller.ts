 import { Request, Response } from "express";
import prisma from "../config/prisma";
import { getCache, setCache } from "../config/cache";

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

export const getUserStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = "users:stats";
    const cached = getCache(cacheKey);
    if (cached) { res.json(cached); return; }

    const [totalUsers, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    ]);

    const result = { totalUsers, byRole };
    setCache(cacheKey, result, 5 * 60);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

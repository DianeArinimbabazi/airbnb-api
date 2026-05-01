import { Response } from "express";
import prisma from "../config/prisma";
import { getCache, setCache, clearCacheByPrefix } from "../config/cache";
import type { AuthRequest } from "../middlewares/auth.middleware";

export const getListingReviews = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `reviews:${id}:${page}:${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { listingId: id },
        include: { user: { select: { name: true, avatar: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where: { listingId: id } }),
    ]);

    const response = {
      data: reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    setCache(cacheKey, response, 30);
    return res.json(response);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;
    const { rating, comment } = req.body;


    if (!rating || !comment) {
      return res.status(400).json({ error: "rating and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        userId,
        listingId: id,
      },
    });

    clearCacheByPrefix(`reviews:${id}`);
    clearCacheByPrefix(`review-summary-${id}`);
    return res.status(201).json(review);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ error: "Review not found" });

    await prisma.review.delete({ where: { id } });
    clearCacheByPrefix(`reviews:${review.listingId}`);
    clearCacheByPrefix(`review-summary-${review.listingId}`);

    return res.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};


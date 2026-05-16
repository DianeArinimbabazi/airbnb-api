import { Router } from "express";
import { getAllUsers, getUserById, updateUser, deleteUser, getUserStats } from "../controllers/users.controller";
import { authenticate } from "../middlewares/auth.middleware";
import prisma from "../config/prisma";

const router = Router();

// stats MUST be before /:id
router.get("/stats", getUserStats);

router.get("/:id/listings", async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({ where: { hostId: req.params.id } });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/:id/bookings", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { guestId: req.params.id },
        skip, take: limit,
        orderBy: { createdAt: "desc" },
        include: { listing: { select: { title: true, location: true, pricePerNight: true, photos: true } } },
      }),
      prisma.booking.count({ where: { guestId: req.params.id } }),
    ]);

    res.json({
      data: bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/", authenticate, getAllUsers);
router.get("/:id", authenticate, getUserById);
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, deleteUser);

export default router;
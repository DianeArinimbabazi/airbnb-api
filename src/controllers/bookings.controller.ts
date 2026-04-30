import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        skip, take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          guest: { select: { name: true, email: true } },
          listing: { select: { title: true, location: true } },
        },
      }),
      prisma.booking.count(),
    ]);

    res.json({
      data: bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        guest: { select: { name: true, email: true } },
        listing: { select: { title: true, location: true, pricePerNight: true } },
      },
    });
    if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { guestId, listingId, checkIn, checkOut } = req.body;

    if (!guestId || !listingId || !checkIn || !checkOut) {
      res.status(400).json({ error: "guestId, listingId, checkIn, and checkOut are required" });
      return;
    }

    const [guest, listing] = await Promise.all([
      prisma.user.findUnique({ where: { id: parseInt(guestId) } }),
      prisma.listing.findUnique({ where: { id: parseInt(listingId) } }),
    ]);

    if (!guest) { res.status(404).json({ error: "User not found" }); return; }
    if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      res.status(400).json({ error: "checkOut must be after checkIn" });
      return;
    }

    const totalPrice = listing.pricePerNight * nights;

    const booking = await prisma.booking.create({
      data: {
        guestId: parseInt(guestId),
        listingId: parseInt(listingId),
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        status: "CONFIRMED",
      },
    });

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: "Booking not found" }); return; }

    await prisma.booking.delete({ where: { id } });
    res.json({ message: "Booking cancelled successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
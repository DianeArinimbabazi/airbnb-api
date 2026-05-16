import { Response, NextFunction } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { sendEmail } from "../config/email";
import { bookingConfirmationEmail, bookingCancellationEmail } from "../templates/emails";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export const getAllBookings = async (req: AuthRequest, res: Response): Promise<void> => {
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
          listing: { select: { title: true, location: true, pricePerNight: true, photos: true } },
        },
      }),
      prisma.booking.count(),
    ]);

    res.json({ data: bookings, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const booking = await prisma.booking.findUnique({
      where: { id },
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

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const guestId = req.userId!;
    const { listingId, checkIn, checkOut } = req.body;

    if (!listingId || !checkIn || !checkOut) {
      res.status(400).json({ error: "listingId, checkIn, and checkOut are required" });
      return;
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId as string } });
    if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) { res.status(400).json({ error: "checkOut must be after checkIn" }); return; }
    if (checkInDate < new Date()) { res.status(400).json({ error: "checkIn must be in the future" }); return; }

    const totalPrice = listing.pricePerNight * nights;

    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          listingId: listingId as string,
          status: "CONFIRMED",
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate },
        },
      });
      if (conflict) throw new Error("BOOKING_CONFLICT");

      return tx.booking.create({
        data: { guestId, listingId: listingId as string, checkIn: checkInDate, checkOut: checkOutDate, totalPrice, status: "CONFIRMED" },
      });
    });

    try {
      const guest = await prisma.user.findUnique({ where: { id: guestId } });
      if (guest) {
        await sendEmail(
          guest.email, "Your booking is confirmed!",
          bookingConfirmationEmail(guest.name, listing.title, listing.location, formatDate(checkInDate), formatDate(checkOutDate), totalPrice)
        );
      }
    } catch (err) {
      console.error("Booking confirmation email failed:", err);
    }

    res.status(201).json(booking);
  } catch (error: any) {
    if (error.message === "BOOKING_CONFLICT") {
      res.status(409).json({ error: "These dates are already booked" });
      return;
    }
    next(error);
  }
};

export const deleteBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.booking.findUnique({ where: { id }, include: { listing: true } });

    if (!existing) { res.status(404).json({ error: "Booking not found" }); return; }
    if (existing.guestId !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }
    if (existing.status === "CANCELLED") {
      res.status(400).json({ error: "Booking is already cancelled" });
      return;
    }

    const cancelled = await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });

    try {
      const guest = await prisma.user.findUnique({ where: { id: req.userId! } });
      if (guest) {
        await sendEmail(
          guest.email, "Your booking has been cancelled",
          bookingCancellationEmail(guest.name, existing.listing.title, formatDate(existing.checkIn), formatDate(existing.checkOut))
        );
      }
    } catch (err) {
      console.error("Booking cancellation email failed:", err);
    }

    res.json(cancelled);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses = ["CONFIRMED", "CANCELLED", "PENDING"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status. Must be CONFIRMED, CANCELLED, or PENDING" });
      return;
    }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }

    const updated = await prisma.booking.update({ where: { id }, data: { status } });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

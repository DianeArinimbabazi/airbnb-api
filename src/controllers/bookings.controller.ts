import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { sendEmail } from "../config/email";
import { bookingConfirmationEmail, bookingCancellationEmail } from "../templates/emails";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { listing: true, guest: true },
    });
    return res.json(bookings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: { listing: true },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.guestId !== req.userId) return res.status(403).json({ error: "Forbidden" });
    return res.json(booking);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listingId, checkIn, checkOut } = req.body;

    if (!listingId || !checkIn || !checkOut) {
      return res.status(400).json({ error: "listingId, checkIn and checkOut are required" });
    }

    const listing = await prisma.listing.findUnique({ where: { id: Number(listingId) } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listing.pricePerNight;

    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          listingId: Number(listingId),
          status: "CONFIRMED",
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate },
        },
      });

      if (conflict) {
        throw new Error("BOOKING_CONFLICT");
      }

      return tx.booking.create({
        data: {
          guestId: req.userId!,
          listingId: Number(listingId),
          checkIn: checkInDate,
          checkOut: checkOutDate,
          totalPrice,
          status: "PENDING",
        },
      });
    });

    try {
      const guest = await prisma.user.findUnique({ where: { id: req.userId! } });
      if (guest) {
        await sendEmail(
          guest.email,
          "Your booking is confirmed!",
          bookingConfirmationEmail(
            guest.name, listing.title, listing.location,
            formatDate(checkInDate), formatDate(checkOutDate), totalPrice
          )
        );
      }
    } catch (err) {
      console.error("Booking confirmation email failed:", err);
    }

    return res.status(201).json(booking);
  } catch (error: any) {
    if (error.message === "BOOKING_CONFLICT") {
      return res.status(409).json({ error: "These dates are already booked" });
    }
    return next(error);
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: { listing: true },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.guestId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    const cancelled = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });

    try {
      const guest = await prisma.user.findUnique({ where: { id: req.userId! } });
      if (guest) {
        await sendEmail(
          guest.email,
          "Your booking has been cancelled",
          bookingCancellationEmail(
            guest.name, booking.listing.title,
            formatDate(booking.checkIn), formatDate(booking.checkOut)
          )
        );
      }
    } catch (err) {
      console.error("Booking cancellation email failed:", err);
    }

    return res.json(cancelled);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const booking = await prisma.booking.findUnique({ where: { id: Number(id) } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const updated = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status },
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
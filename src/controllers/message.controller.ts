import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getMessages(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { bookingId } = req.query;
  if (!bookingId) return res.status(400).json({ message: "bookingId required" });

  const booking = await prisma.booking.findUnique({
    where: { id: String(bookingId) },
    include: { listing: true }
  });
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.guestId !== userId && booking.listing.hostId !== userId)
    return res.status(403).json({ message: "Forbidden" });

  const messages = await prisma.message.findMany({
    where: { bookingId: String(bookingId) },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" }
  });

  // Mark received messages as read
  await prisma.message.updateMany({
    where: { bookingId: String(bookingId), receiverId: userId, read: false },
    data: { read: true }
  });

  res.json(messages);
}

export async function sendMessage(req: Request, res: Response) {
  const senderId = (req as any).user.id;
  const { bookingId, content } = req.body;
  if (!bookingId || !content?.trim())
    return res.status(400).json({ message: "bookingId and content required" });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true }
  });
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const isGuest = booking.guestId === senderId;
  const isHost  = booking.listing.hostId === senderId;
  if (!isGuest && !isHost) return res.status(403).json({ message: "Forbidden" });

  const receiverId = isGuest ? booking.listing.hostId : booking.guestId;

  const message = await prisma.message.create({
    data: { content: content.trim(), senderId, receiverId, bookingId },
    include: { sender: { select: { id: true, name: true, avatar: true } } }
  });

  res.status(201).json(message);
}

export async function getConversations(req: Request, res: Response) {
  const userId = (req as any).user.id;

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: {
      sender:   { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
      booking:  { include: { listing: { select: { id: true, title: true, photos: { take: 1 } } } } }
    },
    orderBy: { createdAt: "desc" }
  });

  // Group by bookingId, keep only latest message per booking
  const map = new Map<string, any>();
  for (const m of messages) {
    if (!map.has(m.bookingId)) map.set(m.bookingId, m);
  }

  // Attach unread count
  const unreadCounts = await prisma.message.groupBy({
    by: ["bookingId"],
    where: { receiverId: userId, read: false },
    _count: { id: true }
  });
  const unreadMap = new Map(unreadCounts.map(u => [u.bookingId, u._count.id]));

  const conversations = Array.from(map.values()).map(m => ({
    ...m,
    unread: unreadMap.get(m.bookingId) ?? 0
  }));

  res.json(conversations);
}

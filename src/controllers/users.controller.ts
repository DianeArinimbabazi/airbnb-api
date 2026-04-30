import { getCache, setCache } from "../config/cache";
import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { listings: true },
        },
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      include: { listings: true, bookings: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, username, phone, role } = req.body;
    if (!name || !email || !username || !phone || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already exists" });
    const user = await prisma.user.create({
      data: { name, email, username, phone, role, avatar: req.body.avatar, bio: req.body.bio },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.user.findFirst({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ error: "User not found" });
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.user.findFirst({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ error: "User not found" });
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const cacheKey = "users:stats";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const [totalUsers, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
    ]);

    const response = {
      totalUsers,
      byRole: byRole.map((r) => ({ role: r.role, count: r._count._all })),
    };

    setCache(cacheKey, response, 300);
    return res.json(response);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
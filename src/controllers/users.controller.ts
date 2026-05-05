import { getCache, setCache } from "../config/cache";
import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  phone: true,
  role: true,
  avatar: true,
  bio: true,
  createdAt: true,
  updatedAt: true,
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { ...safeUserSelect, _count: { select: { listings: true } } },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { ...safeUserSelect, listings: true, bookings: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, username, phone, role, password } = req.body;
    if (!name || !email || !username || !phone || !role || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already exists" });
    const user = await prisma.user.create({
      data: { name, email, username, phone, role, password, avatar: req.body.avatar, bio: req.body.bio },
      select: safeUserSelect,
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "User not found" });
    const user = await prisma.user.update({
      where: { id },
      data: req.body,
      select: safeUserSelect,
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "User not found" });
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const cacheKey = "users:stats";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);
    const [totalUsers, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
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
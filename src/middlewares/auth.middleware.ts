import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "secret";

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireHost(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.role === "HOST" || req.role === "ADMIN") return next();
  res.status(403).json({ error: "Hosts only" });
}

export function requireGuest(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.role === "GUEST" || req.role === "ADMIN") return next();
  res.status(403).json({ error: "Guests only" });
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.role === "ADMIN") return next();
  res.status(403).json({ error: "Admins only" });
}
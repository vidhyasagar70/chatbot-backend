import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided." });
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token || typeof token !== "string") {
    res.status(401).json({ message: "Token missing or invalid." });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (
      typeof decoded === "object" &&
      decoded &&
      "userId" in decoded &&
      "role" in decoded
    ) {
      req.user = {
        userId: (decoded as any).userId,
        role: (decoded as any).role,
      };
      next();
      return;
    } else {
      res.status(401).json({ message: "Invalid token payload." });
      return;
    }
  } catch (err) {
    res.status(401).json({ message: "Invalid token." });
    return;
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied." });
      return;
    }
    next();
    return;
  };
};

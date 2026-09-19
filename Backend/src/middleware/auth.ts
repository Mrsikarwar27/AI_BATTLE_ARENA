import type { NextFunction, Request, Response } from "express";
import User, { toSafeUser, type SafeUser } from "../models/User.js";
import { verifyAuthToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
    user?: SafeUser;
    userId?: string;
}

function extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7).trim();
        if (token) return token;
    }
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const cookieToken = cookies?.token;
    if (typeof cookieToken === "string" && cookieToken) return cookieToken;
    return null;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const token = extractToken(req);
    if (!token) {
        res.status(401).json({ success: false, message: "Authentication required" });
        return;
    }
    try {
        const payload = verifyAuthToken(token);
        const user = await User.findById(payload.sub).lean();
        if (!user) {
            res.status(401).json({ success: false, message: "Authentication required" });
            return;
        }
        const record = user as unknown as Record<string, unknown>;
        const id = String(record._id ?? "");
        req.user = {
            _id: id,
            id,
            firstName: String(record.firstName ?? ""),
            lastName: String(record.lastName ?? ""),
            email: String(record.email ?? ""),
            createdAt: record.createdAt as SafeUser["createdAt"],
            updatedAt: record.updatedAt as SafeUser["updatedAt"],
        };
        req.userId = id;
        next();
    } catch {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
        return;
    }
}

export { toSafeUser };

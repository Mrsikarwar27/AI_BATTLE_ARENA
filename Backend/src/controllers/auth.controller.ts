import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import User, { toSafeUser, type IUser } from "../models/User.js";
import { signAuthToken, setAuthCookie, clearAuthCookie } from "../utils/jwt.js";
import type { AuthRequest } from "../middleware/auth.js";

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts. Please try again later." },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isStrongPassword(password: string): string | null {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        return "Password must contain at least one letter and one number";
    }
    return null;
}

function issueAuth(res: Response, userId: string, user: IUser, status: number, message: string) {
    const token = signAuthToken(userId);
    setAuthCookie(res, token);
    return res.status(status).json({
        success: true,
        message,
        user: toSafeUser(user),
        token,
        isAuthenticated: true,
    });
}

export async function signup(req: Request, res: Response): Promise<void> {
    try {
        const { firstName, lastName, email, password } = req.body as {
            firstName?: unknown;
            lastName?: unknown;
            email?: unknown;
            password?: unknown;
        };

        if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
            res.status(400).json({ success: false, message: "First name is required" });
            return;
        }
        if (!lastName || typeof lastName !== "string" || !lastName.trim()) {
            res.status(400).json({ success: false, message: "Last name is required" });
            return;
        }
        if (!email || typeof email !== "string" || !email.trim()) {
            res.status(400).json({ success: false, message: "Email is required" });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (!EMAIL_RE.test(normalizedEmail) || normalizedEmail.length > 254) {
            res.status(400).json({ success: false, message: "Please provide a valid email address" });
            return;
        }
        if (!password || typeof password !== "string" || !password) {
            res.status(400).json({ success: false, message: "Password is required" });
            return;
        }
        const weakReason = isStrongPassword(password);
        if (weakReason) {
            res.status(400).json({ success: false, message: weakReason });
            return;
        }
        if (firstName.trim().length > 50 || lastName.trim().length > 50) {
            res.status(400).json({ success: false, message: "Name must be at most 50 characters" });
            return;
        }

        const existing = await User.findOne({ email: normalizedEmail }).lean();
        if (existing) {
            res.status(409).json({ success: false, message: "An account with this email already exists" });
            return;
        }

        const user = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            password,
        });
        await user.save();
        issueAuth(res, String(user._id), user, 201, "Account created successfully");
    } catch (err) {
        if (err instanceof Error && err.message.includes("JWT_SECRET")) {
            console.error("Auth misconfiguration: JWT_SECRET missing");
            res.status(500).json({ success: false, message: "Server configuration error" });
            return;
        }
        const code = (err as { code?: number })?.code;
        if (code === 11000) {
            res.status(409).json({ success: false, message: "An account with this email already exists" });
            return;
        }
        if ((err as { name?: string })?.name === "ValidationError") {
            const details = Object.values((err as { errors?: Record<string, { message?: string }> }).errors ?? {})
                .map((e) => e.message)
                .filter(Boolean);
            res.status(400).json({ success: false, message: details[0] ?? "Invalid data provided" });
            return;
        }
        console.error("Signup failed:", err instanceof Error ? err.message : err);
        res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }
}

export async function login(req: Request, res: Response): Promise<void> {
    try {
        const { email, password } = req.body as { email?: unknown; password?: unknown };
        if (!email || typeof email !== "string" || !email.trim() || !password || typeof password !== "string" || !password) {
            res.status(400).json({ success: false, message: "Email and password are required" });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail }).select("+password");
        if (!user) {
            res.status(401).json({ success: false, message: "Invalid email or password" });
            return;
        }
        const ok = await user.comparePassword(password);
        if (!ok) {
            res.status(401).json({ success: false, message: "Invalid email or password" });
            return;
        }
        issueAuth(res, String(user._id), user, 200, "Logged in successfully");
    } catch (err) {
        if (err instanceof Error && err.message.includes("JWT_SECRET")) {
            console.error("Auth misconfiguration: JWT_SECRET missing");
            res.status(500).json({ success: false, message: "Server configuration error" });
            return;
        }
        console.error("Login failed:", err instanceof Error ? err.message : err);
        res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
    // authMiddleware already attached req.user
    res.status(200).json({ success: true, user: req.user, isAuthenticated: true });
}

export async function logout(_req: Request, res: Response): Promise<void> {
    clearAuthCookie(res);
    res.status(200).json({ success: true, message: "Logged out successfully", isAuthenticated: false, user: null });
}

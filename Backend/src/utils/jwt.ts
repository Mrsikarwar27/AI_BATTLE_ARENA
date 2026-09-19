import jwt from "jsonwebtoken";
import type { Response } from "express";
import config from "../config/config.js";

export interface JwtPayload {
    sub: string;
    iat?: number;
    exp?: number;
}

export function signAuthToken(userId: string): string {
    if (!config.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined. Set it in Backend/.env");
    }
    const expiresIn = (config.JWT_EXPIRES_IN || "7d") as `${number}${"s" | "m" | "h" | "d"}`;
    return jwt.sign({ sub: userId }, config.JWT_SECRET, { expiresIn });
}

export function verifyAuthToken(token: string): JwtPayload {
    if (!config.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined. Set it in Backend/.env");
    }
    return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
}

export function setAuthCookie(res: Response, token: string): void {
    const isProd = config.NODE_ENV === "production";
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
    });
}

export function clearAuthCookie(res: Response): void {
    const isProd = config.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
    });
}

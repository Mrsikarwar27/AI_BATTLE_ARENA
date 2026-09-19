import { Router } from "express";
import { signup, login, getMe, logout, authRateLimiter } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/signup", authRateLimiter, signup);
router.post("/login", authRateLimiter, login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;

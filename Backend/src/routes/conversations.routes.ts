import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
    conversationRateLimiter,
    createConversation,
    deleteConversation,
    getConversation,
    listConversations,
    postMessage,
    renameConversation,
} from "../controllers/conversations.controller.js";

const router = Router();

// All conversation endpoints require authentication.
router.use(authMiddleware);

router.get("/", listConversations);
router.post("/", conversationRateLimiter, createConversation);
router.get("/:conversationId", getConversation);
router.patch("/:conversationId", renameConversation);
router.delete("/:conversationId", deleteConversation);
router.post("/:conversationId/messages", conversationRateLimiter, postMessage);

export default router;

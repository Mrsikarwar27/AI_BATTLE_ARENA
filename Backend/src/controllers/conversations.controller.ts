import type { Response } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import Conversation from "../models/Conversation.js";
import type { AuthRequest } from "../middleware/auth.js";
import { generateTitleFromMessage, isDefaultTitle } from "../utils/conversationTitle.js";
import runGraph from "../ai/graph.ai.js";

export const conversationRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later." },
});

function ownerId(req: AuthRequest): string {
    // Always derive identity from verified JWT middleware. Never trust client userId.
    return String(req.user?._id ?? req.userId ?? "");
}

function paramId(req: AuthRequest): string {
    const raw = (req.params as Record<string, unknown>).conversationId;
    return Array.isArray(raw) ? String(raw[0] ?? "") : String(raw ?? "");
}

function isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
}

function toSummary(doc: Record<string, unknown>) {
    const id = String(doc._id ?? "");
    const messages = Array.isArray(doc.messages) ? doc.messages : [];
    // Preview = first ~80 chars of the last user message (cheap, no extra query).
    let preview = "";
    for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i] as { role?: string; content?: unknown };
        if (m?.role === "user" && typeof m.content === "string" && m.content.trim()) {
            preview = m.content.trim().slice(0, 80);
            break;
        }
    }
    return {
        _id: id,
        id,
        title: String(doc.title ?? "New conversation"),
        preview,
        messageCount: messages.length,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}

/** GET /api/conversations?search=&limit= */
export async function listConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = ownerId(req);
        const rawSearch = typeof req.query.search === "string" ? req.query.search.trim() : "";
        const search = rawSearch.slice(0, 100);
        const rawLimit = Number(req.query.limit ?? 100);
        const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 200) : 100;

        const filter: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(userId) };
        if (search) {
            // Scoped to this user only — never a DB-wide search.
            filter.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
        }

        // Sidebar must stay fast: only project the last message for preview,
        // never the full message history.
        const docs = await Conversation.find(filter)
            .sort({ updatedAt: -1 })
            .limit(limit)
            .select("title createdAt updatedAt")
            .slice("messages", -2)
            .lean();

        const summaries = (docs as unknown as Record<string, unknown>[]).map(toSummary);
        res.status(200).json({ success: true, conversations: summaries });
    } catch (err) {
        console.error("List conversations failed:", err instanceof Error ? err.message : err);
        res.status(500).json({ success: false, message: "Could not load conversations. Please try again." });
    }
}

/** POST /api/conversations */
export async function createConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = ownerId(req);
        const { title } = (req.body ?? {}) as { title?: unknown };
        let finalTitle = "New conversation";
        if (typeof title === "string" && title.trim()) {
            if (title.trim().length > 100) {
                res.status(400).json({ success: false, message: "Title must be at most 100 characters" });
                return;
            }
            finalTitle = title.trim().slice(0, 100);
        }
        const convo = await Conversation.create({ title: finalTitle, userId, messages: [] });
        res.status(201).json({
            success: true,
            message: "Conversation created",
            conversation: {
                _id: String(convo._id),
                id: String(convo._id),
                title: convo.title,
                messageCount: 0,
                messages: [],
                createdAt: convo.createdAt,
                updatedAt: convo.updatedAt,
            },
        });
    } catch (err) {
        console.error("Create conversation failed:", err instanceof Error ? err.message : err);
        res.status(500).json({ success: false, message: "Could not create conversation. Please try again." });
    }
}

/** GET /api/conversations/:conversationId */
export async function getConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
        const conversationId = paramId(req);
        if (!conversationId || !isValidObjectId(conversationId)) {
            res.status(404).json({ success: false, message: "Conversation not found" });
            return;
        }
        // Ownership enforced on every query.
        const doc = await Conversation.findOne({ _id: conversationId, userId: ownerId(req) }).lean();
        if (!doc) {
            res.status(404).json({ success: false, message: "Conversation not found" });
            return;
        }
        const record = doc as unknown as Record<string, unknown>;
        const id = String(record._id ?? "");
        res.status(200).json({
            success: true,
            conversation: {
                _id: id,
                id,
                title: String(record.title ?? "New conversation"),
                messages: Array.isArray(record.messages) ? record.messages : [],
                messageCount: Array.isArray(record.messages) ? record.messages.length : 0,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
            },
        });
    } catch (err) {
        console.error("Get conversation failed:", err instanceof Error ? err.message : err);
        res.status(500).json({ success: false, message: "Could not load conversation. Please try again." });
    }
}

/** PATCH /api/conversations/:conversationId */
export async function renameConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
        const conversationId = paramId(req);
        if (!conversationId || !isValidObjectId(conversationId)) {
            res.status(404).json({ success: false, message: "Conversation not found" });
            return;
        }
        const { title } = (req.body ?? {}) as { title?: unknown };
        if (typeof title !== "string" || !title.trim()) {
            res.status(400).json({ success: false, message: "Title is required" });
            return;
        }
        if (title.trim().length > 100) {
            res.status(400).json({ success: false, message: "Title must be at most 100 characters" });
            return;
        }
        const doc = await Conversation.findOneAndUpdate(
            { _id: conversationId, userId: ownerId(req) },
            { $set: { title: title.trim().slice(0, 100) } },
            { returnDocument: "after" }
        )
            .select("title createdAt updatedAt")
            .lean();
        if (!doc) {
            res.status(404).json({ success: false, message: "Conversation not found" });
            return;
        }
        const record = doc as unknown as Record<string, unknown>;
        const id = String(record._id ?? "");
        res.status(200).json({
            success: true,
            message: "Conversation renamed",
            conversation: {
                _id: id,
                id,
                title: String(record.title ?? ""),
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
            },
        });
    } catch (err) {
        console.error("Rename conversation failed:", err instanceof Error ? err.message : err);
        res.status(500).json({ success: false, message: "Could not rename conversation. Please try again." });
    }
}

/** DELETE /api/conversations/:conversationId */
export async function deleteConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
        const conversationId = paramId(req);
        if (!conversationId || !isValidObjectId(conversationId)) {
            res.status(404).json({ success: false, message: "Conversation not found" });
            return;
        }
        // Messages are embedded, so deleting the conversation removes them too.
        const doc = await Conversation.findOneAndDelete({ _id: conversationId, userId: ownerId(req) }).lean();
        if (!doc) {
            res.status(404).json({ success: false, message: "Conversation not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Conversation deleted" });
    } catch (err) {
        console.error("Delete conversation failed:", err instanceof Error ? err.message : err);
        res.status(500).json({ success: false, message: "Could not delete conversation. Please try again." });
    }
}

function getHttpStatus(err: unknown): number | undefined {
    if (typeof err !== "object" || err === null) return undefined;
    const e = err as { statusCode?: unknown; status?: unknown };
    if (typeof e.statusCode === "number") return e.statusCode;
    if (typeof e.status === "number") return e.status;
    return undefined;
}

/**
 * POST /api/conversations/:conversationId/messages
 * Body: { input: string } (also accepts `content` / `message` aliases)
 *
 * 1. Identify user from JWT. 2. Load owned conversation. 3. Save user
 * message. 4. Run existing AI graph. 5. Save assistant response.
 * 6. Bump updatedAt. 7. Auto-title from first message when appropriate.
 */
export async function postMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
        const conversationId = paramId(req);
        if (!conversationId || !isValidObjectId(conversationId)) {
            res.status(404).json({ success: false, message: "Conversation not found" });
            return;
        }
        const body = (req.body ?? {}) as { input?: unknown; content?: unknown; message?: unknown };
        const raw = body.input ?? body.content ?? body.message;
        if (typeof raw !== "string" || !raw.trim()) {
            res.status(400).json({ success: false, message: "Message is required" });
            return;
        }
        const input = raw.trim();
        if (input.length > 8000) {
            res.status(400).json({ success: false, message: "Message is too long (max 8000 characters)" });
            return;
        }

        const convo = await Conversation.findOne({ _id: conversationId, userId: ownerId(req) });
        if (!convo) {
            res.status(404).json({ success: false, message: "Conversation not found" });
            return;
        }

        // Run the AI FIRST and persist both messages together afterwards.
        // Saving the user message before the AI call used to orphan it
        // whenever generation failed (e.g. transient provider 429/5xx),
        // leaving a permanent "response could not be saved" error with no
        // recovery except duplicating the message via retry.
        let result: Awaited<ReturnType<typeof runGraph>>;
        try {
            result = await runGraph(input);
        } catch (err) {
            // Nothing was persisted; the user can retry cleanly.
            const status = getHttpStatus(err);
            const rawMessage = err instanceof Error ? err.message : "AI provider request failed";
            console.error(`Conversation message AI failed: ${rawMessage.slice(0, 300)}`);
            if (status === 429) {
                res.status(429).json({ success: false, message: rawMessage || "AI rate limit exceeded. Wait ~60s and try again." });
                return;
            }
            res.status(502).json({ success: false, message: "AI provider request failed. Please try again." });
            return;
        }

        const winner =
            result.judge.solution_1_score === result.judge.solution_2_score
                ? "Tie"
                : result.judge.solution_1_score > result.judge.solution_2_score
                  ? "Model 1 (Mistral) wins"
                  : "Model 2 (Cohere) wins";
        const summary = `Battle for "${result.problem.slice(0, 80)}" — Mistral ${result.judge.solution_1_score.toFixed(1)} vs Cohere ${result.judge.solution_2_score.toFixed(1)}. ${winner}.`;

        // AI succeeded: persist the user message and the assistant response
        // in a single save so one can never exist without the other.
        const hadMessages = convo.messages.length === 0;
        convo.messages.push({ role: "user", content: input, createdAt: new Date() } as never);
        // Auto-title from the first user message while the title is still default.
        if ((hadMessages || isDefaultTitle(convo.title)) && convo.messages.filter((m) => m.role === "user").length <= 1) {
            convo.title = generateTitleFromMessage(input);
        }
        convo.messages.push({
            role: "assistant",
            content: summary,
            createdAt: new Date(),
            metadata: {
                problem: result.problem,
                solution_1: result.solution_1,
                solution_2: result.solution_2,
                judge: result.judge,
            },
        } as never);
        convo.updatedAt = new Date();
        await convo.save();

        res.status(200).json({
            success: true,
            message: "Battle complete",
            conversationId: String(convo._id),
            conversationTitle: convo.title,
            result,
        });
    } catch (err) {
        console.error("Post message failed:", err instanceof Error ? err.message : err);
        res.status(500).json({ success: false, message: "Could not save message. Please try again." });
    }
}

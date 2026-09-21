import express from 'express';
import runGraph from "./ai/graph.ai.js"
import cors from "cors"
import path from "path"
import { fileURLToPath } from 'url';
import cookieParser from "cookie-parser"
import helmet from "helmet"
import config from "./config/config.js";
import authRoutes from "./routes/auth.routes.js";
import conversationRoutes from "./routes/conversations.routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: config.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}))

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);


app.get('/', (req, res) => {
    // Lightweight health check. Do NOT call runGraph here — every call
    // burns Mistral/Cohere/Gemini quota and triggers 429 rate limits.
    res.json({ status: "ok", service: "ai-battle-arena-backend" })
})

//wildcard route to serve the frontend for any other route
app.get('*any', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});



app.get('/api/health', (req, res) => {
    res.json({ status: "ok", service: "ai-battle-arena-backend" })
})

function getHttpStatus(err: unknown): number | undefined {
    if (typeof err !== "object" || err === null) return undefined;
    const e = err as { statusCode?: unknown; status?: unknown; code?: unknown; provider?: unknown };
    if (typeof e.statusCode === "number") return e.statusCode;
    if (typeof e.status === "number") return e.status;
    return undefined;
}

app.post("/invoke", async (req, res) => {

    const { input } = req.body
    if (!input || typeof input !== "string" || !input.trim()) {
        return res.status(400).json({
            message: "Input is required",
            success: false,
        })
    }

    try {
        const result = await runGraph(input.trim())

        return res.status(200).json({
            message: "Graph executed successfully",
            success: true,
            result
        })
    } catch (err) {
        const status = getHttpStatus(err);
        const provider = (err as { provider?: string })?.provider;
        const rawMessage = err instanceof Error ? err.message : "Unknown error";
        // Concise log: full SDK dumps (headers, streams) spam the console.
        console.error(`Graph execution failed${provider ? ` [${provider}]` : ""}${status ? ` (status ${status})` : ""}: ${rawMessage.slice(0, 500)}`);

        if (status === 429) {
            return res.status(429).json({
                message: rawMessage || "AI rate limit exceeded. Wait ~60s and try again.",
                success: false,
                retryAfterSeconds: 60,
            })
        }
        if (status === 401 || status === 403) {
            return res.status(502).json({
                message: "AI provider authentication failed. Check API keys and try again.",
                success: false,
            })
        }
        return res.status(500).json({
            message: "AI provider request failed. Check API keys and try again.",
            success: false,
        })
    }

})



export default app;

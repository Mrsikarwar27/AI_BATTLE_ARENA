import app from "./src/app.js";
import config from "./src/config/config.js";
import { connectDB } from "./src/config/db.js";

const PORT = config.PORT || 3000;

async function start() {
    try {
        await connectDB();
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err instanceof Error ? err.message : err);
        console.error("Set a valid MONGODB_URI in Backend/.env and restart.");
        process.exit(1);
    }

    if (!config.JWT_SECRET) {
        console.error("JWT_SECRET is not set. Set it in Backend/.env and restart.");
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

void start();

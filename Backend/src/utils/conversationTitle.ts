/**
 * Deterministic short title from the first user message.
 * Avoids an extra expensive AI call for something simple.
 *
 * "How do I learn React?"      -> "How do I learn React"
 * "Fix my MongoDB connection"  -> "Fix my MongoDB connection"
 */
export function generateTitleFromMessage(input: string): string {
    const collapsed = (input ?? "").replace(/\s+/g, " ").trim().replace(/["'`]+/g, "");
    if (!collapsed) return "New conversation";
    // Strip trailing punctuation (? ! . ,) for a cleaner title.
    const stripped = collapsed.replace(/[?.!,;:]+$/g, "").trim();
    if (!stripped) return "New conversation";
    const words = stripped.split(" ").slice(0, 6).join(" ");
    const truncated = words.length > 45 ? `${words.slice(0, 45).trim()}…` : words;
    const titled = truncated.charAt(0).toUpperCase() + truncated.slice(1);
    return titled.slice(0, 100) || "New conversation";
}

export function isDefaultTitle(title: string | undefined | null): boolean {
    if (!title) return true;
    const t = title.trim().toLowerCase();
    return t === "" || t === "new conversation" || t === "new chat" || t === "untitled";
}

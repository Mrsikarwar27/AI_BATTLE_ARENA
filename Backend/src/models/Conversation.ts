import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type MessageRole = "user" | "assistant" | "system";

export interface IConversationMessage {
    _id?: Types.ObjectId;
    role: MessageRole;
    content: string;
    createdAt: Date;
    metadata?: Record<string, unknown>;
}

export interface IConversation extends Document {
    title: string;
    userId: Types.ObjectId;
    messages: IConversationMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IConversationMessage>(
    {
        role: {
            type: String,
            enum: ["user", "assistant", "system"],
            required: [true, "Message role is required"],
        },
        content: {
            type: String,
            required: [true, "Message content is required"],
            trim: true,
            maxlength: [20000, "Message content is too long"],
        },
        createdAt: {
            type: Date,
            default: () => new Date(),
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: undefined,
        },
    },
    { _id: true }
);

const conversationSchema = new Schema<IConversation>(
    {
        title: {
            type: String,
            required: [true, "Conversation title is required"],
            trim: true,
            minlength: [1, "Conversation title is required"],
            maxlength: [100, "Conversation title must be at most 100 characters"],
            default: "New conversation",
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Conversation owner is required"],
            index: true,
        },
        messages: {
            type: [messageSchema],
            default: [],
        },
    },
    { timestamps: true }
);

// Efficient per-user history queries. Sidebar lists sort by updatedAt;
// all ownership checks filter on { _id, userId }.
conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ userId: 1, createdAt: -1 });

const Conversation: Model<IConversation> =
    mongoose.models.Conversation ?? mongoose.model<IConversation>("Conversation", conversationSchema);

export default Conversation;

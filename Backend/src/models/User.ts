import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}

export interface SafeUser {
    _id: string;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            minlength: [1, "First name is required"],
            maxlength: [50, "First name must be at most 50 characters"],
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            minlength: [1, "Last name is required"],
            maxlength: [50, "Last name must be at most 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            maxlength: [254, "Email is too long"],
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
            index: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false,
        },
    },
    { timestamps: true }
);

// Normalize email/names before validation
userSchema.pre("validate", function () {
    if (this.email && typeof this.email === "string") {
        this.email = this.email.trim().toLowerCase();
    }
    if (this.firstName && typeof this.firstName === "string") {
        this.firstName = this.firstName.trim();
    }
    if (this.lastName && typeof this.lastName === "string") {
        this.lastName = this.lastName.trim();
    }
});

// Hash password only when modified
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
    const self = this as IUser;
    return bcrypt.compare(candidate, self.password);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject() as unknown as Record<string, unknown>;
    delete obj.password;
    delete obj.__v;
    return obj;
};

export function toSafeUser(doc: IUser): SafeUser {
    const o = doc.toObject() as unknown as Record<string, unknown>;
    delete o.password;
    delete o.__v;
    const id = String(o._id ?? o.id ?? "");
    return {
        _id: id,
        id,
        firstName: String(o.firstName ?? ""),
        lastName: String(o.lastName ?? ""),
        email: String(o.email ?? ""),
        createdAt: o.createdAt as Date,
        updatedAt: o.updatedAt as Date,
    };
}

const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);

export default User;

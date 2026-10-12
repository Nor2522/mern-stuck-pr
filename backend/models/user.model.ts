import mongoose, { type InferSchemaType } from "mongoose";

const { Schema } = mongoose;

const Userschema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "please fill avalid email address"],
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    avatar: {
      url: { type: String },
      publicId: { type: String },
    },
    bio: {
      type: String,
      maxLength: 160,
    },
  },
  { timestamps: true },
);

export type UserType = InferSchemaType<typeof Userschema>;

const User = mongoose.model("User", Userschema);

export default User;

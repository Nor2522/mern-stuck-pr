import mongoose, { type InferSchemaType } from "mongoose";

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      maxLength: 120,
    },
    description: {
      type: String,
      required: true,
      maxLength: 2000,
    },
    // image is optional: text-only posts are allowed
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 5,
        message: "tags must be at most 5",
      },
    },
    status: {
      type: String,
      enum: ["published", "hidden"],
      default: "published",
    },
    likesCount: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ category: 1 });
postSchema.index({ title: "text", description: "text" });

export type PostType = InferSchemaType<typeof postSchema>;

const Post = mongoose.model("post", postSchema);

export default Post;

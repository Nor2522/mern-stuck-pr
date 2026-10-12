import mongoose, { type InferSchemaType } from "mongoose";

const { Schema } = mongoose;

const bookmarkSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

export type BookmarkType = InferSchemaType<typeof bookmarkSchema>;

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;

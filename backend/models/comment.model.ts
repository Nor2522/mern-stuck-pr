import mongoose, { type InferSchemaType } from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 500,
    },
  },
  { timestamps: true },
);

commentSchema.index({ post: 1, createdAt: -1 });

export type CommentType = InferSchemaType<typeof commentSchema>;

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;

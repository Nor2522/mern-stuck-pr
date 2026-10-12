import mongoose, { type InferSchemaType } from "mongoose";

const { Schema } = mongoose;

const likeSchema = new Schema(
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

// Hal like kaliya hal user + hal post
likeSchema.index({ user: 1, post: 1 }, { unique: true });

export type LikeType = InferSchemaType<typeof likeSchema>;

const Like = mongoose.model("Like", likeSchema);

export default Like;

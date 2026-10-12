import mongoose, { type InferSchemaType } from "mongoose";

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
  },
  { timestamps: true },
);

export type CategoryType = InferSchemaType<typeof categorySchema>;

const Category = mongoose.model("Category", categorySchema);

export default Category;

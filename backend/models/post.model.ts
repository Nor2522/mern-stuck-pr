import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: { type: String, required: [true, "title is required"] },
  description: { type: String, required: true },
  image: {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // loo baahan yahay marka sawirka la tirtirayo
  },
}, { timestamps: true });
const Post = mongoose.model("post", postSchema);

export default Post;

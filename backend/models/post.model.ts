import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: ["title is required:", true],
  },
  description: {
    type: String,
    required: true,
  },
});
const Post = mongoose.model("post", postSchema);

export default Post;

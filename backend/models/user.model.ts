import mongoose from "mongoose";

const { Schema } = mongoose;

const Userschema = new Schema(
  {
    name: {
      type: String,
      required:true,
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
      required:true,
      trim: true,
      minLength: 5,
    },
  },
  { timestamps: true },
);


const User = mongoose.model("User",Userschema);

export default User
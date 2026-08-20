import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const Userschema = new Schema(
  {
    name: {
      type: String,
      require: ["name is required ", true],
      trim: true,
      minLength: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      require: ["email is requird ", true],
      trim: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "please fill avalid email address"],
    },
    password: {
      type: String,
      require: ["password is required ", true],
      trim: true,
      minLength: 5,
    },
  },
  { timestamps: true },
);


const User = mongoose.model("User",Userschema);

export default User
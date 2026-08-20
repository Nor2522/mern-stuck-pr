import User from "../models/user.model";
import bcrypt from "bcrypt";

const register = async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;
    const userExist = await User.findOne({ $or: [{ email }, { name }] });
    if (userExist) {
      return res.status(400).json({
        message: "user or email already exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    return res.status(201).json({
      message: "user created successfully",
      user: {
        name: user.name,
        email: user.email,
        id: user._id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
    });
  }
};

const signIn = async (req: any, res: any) => {
  const { email, password } = req.body;
 const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "user not found",
    });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password as string);
  if (!isPasswordValid) {
    return res.status(400).json({
      message: "invalid password",
    });
  }
  return res.status(200).json({
    message: "user signed in successfully",
    user: {
      name: user.name,
      email: user.email,
      id: user._id,
    },
  });
};

export { register, signIn };

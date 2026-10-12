import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import { DB_URI } from "../config/env";

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const run = async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      "Khalad: ADMIN_EMAIL iyo ADMIN_PASSWORD waa loo baahan yahay (.env).",
    );
    process.exit(1);
  }

  await mongoose.connect(DB_URI, { retryWrites: false });

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== "admin" || existing.isBanned) {
      existing.role = "admin";
      existing.isBanned = false;
      await existing.save();
      console.log(`Isticmaalaha ${ADMIN_EMAIL} waxaa loo dallacsiiyay admin.`);
    } else {
      console.log(`${ADMIN_EMAIL} horey ayaa admin u ahaa.`);
    }
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      name: "Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });
    console.log(`Admin cusub ayaa la abuuray: ${ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error(`Khalad: ${(error as Error).message}`);
  process.exit(1);
});

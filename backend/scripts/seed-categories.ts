import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "../models/category.model";
import { DB_URI } from "../config/env";

dotenv.config();

// Liiska categories-ka aasaasiga ah (slug waa la soo saaraa magaca)
const categories = [
  "Web",
  "Mobile",
  "AI",
  "Security",
  "DevOps",
  "Career",
  "Learning",
  "Projects",
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Non-destructive: kaliya ku dar (upsert) categories aan horey u jirin
const run = async () => {
  await mongoose.connect(DB_URI, { retryWrites: false });

  for (const name of categories) {
    const slug = slugify(name);
    await Category.updateOne(
      { slug },
      { $setOnInsert: { name, slug } },
      { upsert: true },
    );
  }

  const total = await Category.countDocuments();
  console.log(`Categories-ka la keydiyay: ${total}`);
  console.log("Cusub lama tirtirin waxna lama beddelin.");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error(`Khalad: ${(error as Error).message}`);
  process.exit(1);
});

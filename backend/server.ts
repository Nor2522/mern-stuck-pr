import app from "./app.ts";
import { PORT } from "./config/env.ts";
import connectDB from "./database/mongodb.ts";

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
});

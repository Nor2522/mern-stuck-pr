import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import { CLIENT_URL, PORT } from "./config/env.ts"
import authrouter from "./routes/auth.route.ts"
import connectDB from "./database/mongodb.ts"
import postRouter from "./routes/post.route.ts"
import categoryRouter from "./routes/category.route.ts"
import commentRouter from "./routes/comment.route.ts"
import bookmarkRouter from "./routes/bookmark.route.ts"
import adminRouter from "./routes/admin.route.ts"
import { errorHandler, notFound } from "./middlewares/error.middleware.ts"

const app = express()

// Basic security
app.use(helmet())

// CORS: allow the frontend (CLIENT_URL) to talk to the backend
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
)

app.use(cookieParser())
app.use(express.json())

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" } })
})

// Routes
app.use("/api/user", authrouter)
app.use("/api/post", postRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/comment", commentRouter)
app.use("/api/bookmarks", bookmarkRouter)
app.use("/api/admin", adminRouter)

// 404 + global error handler (must be last)
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)
  await connectDB()
})

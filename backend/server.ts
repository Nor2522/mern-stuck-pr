import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import { CLIENT_URL, PORT } from "./config/env.ts"
import authrouter from "./routes/auth.route.ts"
import connectDB from "./database/mongodb.ts"
import postRouter from "./routes/post.route.ts"
import categoryRouter from "./routes/category.route.ts"
import { errorHandler, notFound } from "./middlewares/error.middleware.ts"

const app = express()

// Ammaanka aasaasiga ah
app.use(helmet())

// CORS: oggolow frontend-ka (CLIENT_URL) inuu la hadlo backend-ka
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

// 404 + global error handler (waa inay ugu dambeeyaan)
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, async () => {
  console.log(`Server-ku wuxuu socdaa port ${PORT}`)
  await connectDB()
})

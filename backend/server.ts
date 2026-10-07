import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { PORT } from "./config/env.ts"
import authrouter from "./routes/auth.route.ts"
import connetDB from "./database/mongodb.ts"
import postRouter from "./routes/post.route.ts"

const app = express()

// 1) CORS: oggolow frontend-ka (5173) inuu la hadlo backend-ka


// 2) cookie-parser: u beddel Cookie header-ka req.cookies (token-ka)
app.use(cookieParser())

// 3) JSON body parser
app.use(express.json())

// Routes (waa inay kadambeeyaan middleware-yada kore)
app.use("/api/user", authrouter)
app.use("/api/post", postRouter)

app.listen(PORT, async () => {
  console.log(`server is running on port ${PORT}`)
  await connetDB()
})

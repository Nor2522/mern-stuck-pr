import express from "express"
import { PORT } from "./config/env.ts"
import authrouter from "./routes/auth.route.ts"
import connetDB from "./database/mongodb.ts"
import postRouter from "./routes/post.route.ts"

const app = express()

app.use(express.json())
app.use("/api/user", authrouter)
app.use("/api/post", postRouter)
  
app.listen(PORT, async()=>{
    console.log(`server is runing on port ${PORT} `)
    await connetDB()
})
import express from "express"
import { PORT } from "./config/env.ts"
import authrouter from "./routes/auth.route.ts"
import connetDB from "./database/mongodb.ts"

const app = express()

app.use(express.json())
app.use("/api/user", authrouter)

  
app.listen(PORT, async()=>{
    console.log(`server is runing on port ${PORT} `)
    await connetDB()
})
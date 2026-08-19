import express from "express"
import { PORT } from "./config/env.ts"
import connetDB from "./database/mongodb.ts"

const app = express()

app.get("/api",(req,res)=>{
    res.send("Hello World")
})
  
app.listen(PORT, async()=>{
    console.log(`server is runing on port ${PORT} `)
    await connetDB()
})
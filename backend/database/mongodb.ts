import mongoose from "mongoose";
import { DB_URI } from "../config/env.ts";

if (!DB_URI){
   throw new Error(
    "please define the MONGO_URI enviroment variable inside .env <development/production>.local"
   )
}

const connetDB = async () => {
    try {
        await mongoose.connect(DB_URI as string, { retryWrites: false });
        console.log("mongodb connnected successfuly ");
    } catch (error) {
        console.log(`there is an error: ${error}`); 
    }
}

export default connetDB
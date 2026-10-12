import { register, signIn, signOut } from "../controllers/auth.controller.ts";
import Router from "express";

const authrouter = Router();

authrouter.post("/sign-up", register);
authrouter.post("/login", signIn);
authrouter.post("/sign-out", signOut);

export default authrouter;

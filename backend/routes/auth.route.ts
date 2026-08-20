import { register, signIn } from "../controllers/auth.controller.ts";
import Router from "express";

const authrouter = Router();

authrouter.post("/sign-up", register);
authrouter.post("/sign-in", signIn);
authrouter.post("/sign-out", register);

export default authrouter;

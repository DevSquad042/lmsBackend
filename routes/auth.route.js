import { signup } from "../controllers/auth/signup.controller.js";
import express from "express";
import { verifyEmail } from "../controllers/auth/verifyEmail.controller.js";
const authRouter = express.Router();
import { login } from "../controllers/auth/login.controller.js";
import { logout } from "../controllers/auth/logout.controller.js";


authRouter.post("/signup", signup);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/login", login);
authRouter.post("/logout", logout);


export default authRouter;
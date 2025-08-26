import { signup } from "../controllers/auth/signup.controller.js";
import express from "express";
import { verifyEmail } from "../controllers/auth/verifyEmail.controller.js";
const authRouter = express.Router();
import { login } from "../controllers/auth/login.controller.js";
import { logout } from "../controllers/auth/logout.controller.js";
import { forgotPassword } from "../controllers/auth/forgotPassword.controller.js";
import { resetPassword } from "../controllers/auth/resetPassword.controller.js";
import { googleAuth } from "../controllers/auth/goggleAuth.controller.js";


authRouter.post("/signup", signup);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword)
authRouter.post("/goggle/callback", googleAuth);


export default authRouter;
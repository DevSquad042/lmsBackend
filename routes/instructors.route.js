import express from "express";
import { getAllInstructors } from "../controllers/instructor.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";


const instructorsRoute = express.Router();
instructorsRoute.use(verifyToken)
instructorsRoute.get("/", getAllInstructors);
export default instructorsRoute;

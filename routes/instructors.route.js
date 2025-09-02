import express from "express";
import { getAllInstructors } from "../controllers/instructor.controller.js";


const instructorsRoute = express.Router();
instructorsRoute.get("/", getAllInstructors);
export default instructorsRoute;

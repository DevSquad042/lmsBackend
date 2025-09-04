import express from "express";
import { searchCourses } from "../controllers/search.controller.js";


const searchCoursesRoute = express.Router();    
searchCoursesRoute.get("/", searchCourses);

export default searchCoursesRoute;
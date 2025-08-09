import express from 'express';
import {rating} from "../controllers/auth/reviewcontroller.js";

const reviewrouter = express.Router();

reviewrouter.put("/rating", rating);

// routes/review.route.js

import express from "express";
const router = express.Router();
import { protectRoute } from "../middleware/auth.middleware.js";
import { analyzeReviews, createReview, getReviewsBySentiment } from "../controllers/review.controller.js";


// POST route to handle review submission

router.post('/:id',protectRoute, createReview);
router.get('/analyze', analyzeReviews);
router.get('/sentiment/:type', getReviewsBySentiment);
export default router;

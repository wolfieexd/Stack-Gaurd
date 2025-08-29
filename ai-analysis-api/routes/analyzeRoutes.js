import express from "express";
import analyzeController from "../controllers/analyzeController.js";

const router = express.Router();

router.post("/analyze", analyzeController);

// Health check for AI API
router.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "StackGuard AI Analysis API",
    timestamp: new Date().toISOString() 
  });
});

export default router;

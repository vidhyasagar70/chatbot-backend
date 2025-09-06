import express from "express";
import {
  getDiamonds,
  getDiamondById,
  getDiamondBySku,
  createDiamond,
  updateDiamond,
  deleteDiamond,
  bulkCreateDiamonds,
  getInventoryStats,
  updateDiamondStatus,
} from "../controllers/diamondController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all diamond routes
router.use(authenticate);

// GET routes
router.get("/", getDiamonds); // Get all diamonds with filtering
router.get("/stats", getInventoryStats); // Get inventory statistics
router.get("/sku/:sku", getDiamondBySku); // Get diamond by SKU
router.get("/:id", getDiamondById); // Get diamond by ID

// POST routes
router.post("/", createDiamond); // Create new diamond
router.post("/bulk", bulkCreateDiamonds); // Bulk create diamonds

// PUT routes
router.put("/:id", updateDiamond); // Update diamond
router.put("/:id/status", updateDiamondStatus); // Update diamond status only

// DELETE routes
router.delete("/:id", deleteDiamond); // Delete diamond

export default router;

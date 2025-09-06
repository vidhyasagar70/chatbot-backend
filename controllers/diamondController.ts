import { Request, Response } from "express";
import { Diamond, IDiamond } from "../models/Diamond";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";

// Get all diamonds with filtering, sorting, and pagination
export const getDiamonds = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "-dateAdded",
      shape,
      cut,
      color,
      clarity,
      status,
      minCarat,
      maxCarat,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (shape) filter.shape = shape;
    if (cut) filter.cut = cut;
    if (color) filter.color = color;
    if (clarity) filter.clarity = clarity;
    if (status) filter.status = status;

    // Carat range filter
    if (minCarat || maxCarat) {
      filter.carat = {};
      if (minCarat) filter.carat.$gte = Number(minCarat);
      if (maxCarat) filter.carat.$lte = Number(maxCarat);
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Search filter (SKU, certificate number, or description)
    if (search) {
      filter.$or = [
        { sku: { $regex: search, $options: "i" } },
        { certificateNumber: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const diamonds = await Diamond.find(filter)
      .populate("createdBy", "name email")
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum);

    const total = await Diamond.countDocuments(filter);

    res.json({
      success: true,
      data: diamonds,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching diamonds:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching diamonds",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get single diamond by ID
export const getDiamondById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid diamond ID",
      });
      return;
    }

    const diamond = await Diamond.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!diamond) {
      res.status(404).json({
        success: false,
        message: "Diamond not found",
      });
      return;
    }

    res.json({
      success: true,
      data: diamond,
    });
  } catch (error) {
    console.error("Error fetching diamond:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching diamond",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get diamond by SKU
export const getDiamondBySku = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sku } = req.params;

    if (!sku) {
      res.status(400).json({
        success: false,
        message: "SKU is required",
      });
      return;
    }

    const diamond = await Diamond.findOne({ sku: sku.toUpperCase() }).populate(
      "createdBy",
      "name email"
    );

    if (!diamond) {
      res.status(404).json({
        success: false,
        message: "Diamond not found",
      });
      return;
    }

    res.json({
      success: true,
      data: diamond,
    });
  } catch (error) {
    console.error("Error fetching diamond by SKU:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching diamond",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create new diamond
export const createDiamond = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const diamondData = {
      ...req.body,
      createdBy: req.user.userId, // From auth middleware
      sku: req.body.sku?.toUpperCase(),
    };

    // Check if SKU already exists
    const existingSku = await Diamond.findOne({ sku: diamondData.sku });
    if (existingSku) {
      res.status(400).json({
        success: false,
        message: "Diamond with this SKU already exists",
      });
      return;
    }

    // Check if certificate number already exists
    const existingCert = await Diamond.findOne({
      certificateNumber: req.body.certificateNumber,
    });
    if (existingCert) {
      res.status(400).json({
        success: false,
        message: "Diamond with this certificate number already exists",
      });
      return;
    }

    const diamond = new Diamond(diamondData);
    await diamond.save();

    const populatedDiamond = await Diamond.findById(diamond._id).populate(
      "createdBy",
      "name email"
    );

    res.status(201).json({
      success: true,
      message: "Diamond created successfully",
      data: populatedDiamond,
    });
  } catch (error) {
    console.error("Error creating diamond:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error creating diamond",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update diamond
export const updateDiamond = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid diamond ID",
      });
      return;
    }

    // Check if diamond exists
    const existingDiamond = await Diamond.findById(id);
    if (!existingDiamond) {
      res.status(404).json({
        success: false,
        message: "Diamond not found",
      });
      return;
    }

    // Check if SKU is being changed and if it already exists
    if (req.body.sku && req.body.sku.toUpperCase() !== existingDiamond.sku) {
      const existingSku = await Diamond.findOne({
        sku: req.body.sku.toUpperCase(),
        _id: { $ne: id },
      });
      if (existingSku) {
        res.status(400).json({
          success: false,
          message: "Diamond with this SKU already exists",
        });
        return;
      }
    }

    // Check if certificate number is being changed and if it already exists
    if (
      req.body.certificateNumber &&
      req.body.certificateNumber !== existingDiamond.certificateNumber
    ) {
      const existingCert = await Diamond.findOne({
        certificateNumber: req.body.certificateNumber,
        _id: { $ne: id },
      });
      if (existingCert) {
        res.status(400).json({
          success: false,
          message: "Diamond with this certificate number already exists",
        });
        return;
      }
    }

    const updateData = {
      ...req.body,
      sku: req.body.sku?.toUpperCase(),
      lastModified: new Date(),
    };

    const diamond = await Diamond.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    res.json({
      success: true,
      message: "Diamond updated successfully",
      data: diamond,
    });
  } catch (error) {
    console.error("Error updating diamond:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error updating diamond",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete diamond
export const deleteDiamond = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid diamond ID",
      });
      return;
    }

    const diamond = await Diamond.findByIdAndDelete(id);

    if (!diamond) {
      res.status(404).json({
        success: false,
        message: "Diamond not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Diamond deleted successfully",
      data: diamond,
    });
  } catch (error) {
    console.error("Error deleting diamond:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting diamond",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Bulk operations
export const bulkCreateDiamonds = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { diamonds } = req.body;

    if (!Array.isArray(diamonds) || diamonds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Invalid diamonds data. Expected array of diamonds.",
      });
      return;
    }

    const diamondsData = diamonds.map((diamond) => ({
      ...diamond,
      createdBy: (req as any).user.userId,
      sku: diamond.sku?.toUpperCase(),
    }));

    const createdDiamonds = await Diamond.insertMany(diamondsData, {
      ordered: false,
    });

    res.status(201).json({
      success: true,
      message: `${createdDiamonds.length} diamonds created successfully`,
      data: createdDiamonds,
    });
  } catch (error: any) {
    console.error("Error bulk creating diamonds:", error);

    if (error.code === 11000) {
      const duplicateErrors =
        error.writeErrors?.filter((err: any) => err.code === 11000) || [];
      const otherErrors =
        error.writeErrors?.filter((err: any) => err.code !== 11000) || [];

      res.status(400).json({
        success: false,
        message: "Bulk create completed with errors",
        duplicateCount: duplicateErrors.length,
        errorCount: otherErrors.length,
        successCount: error.result?.nInserted || 0,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error bulk creating diamonds",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get inventory statistics
export const getInventoryStats = async (req: Request, res: Response) => {
  try {
    const stats = await Diamond.aggregate([
      {
        $group: {
          _id: null,
          totalDiamonds: { $sum: 1 },
          totalValue: { $sum: "$price" },
          averagePrice: { $avg: "$price" },
          averageCarat: { $avg: "$carat" },
          availableCount: {
            $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] },
          },
          soldCount: {
            $sum: { $cond: [{ $eq: ["$status", "sold"] }, 1, 0] },
          },
          reservedCount: {
            $sum: { $cond: [{ $eq: ["$status", "reserved"] }, 1, 0] },
          },
        },
      },
    ]);

    const shapeStats = await Diamond.aggregate([
      {
        $group: {
          _id: "$shape",
          count: { $sum: 1 },
          averagePrice: { $avg: "$price" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const colorStats = await Diamond.aggregate([
      {
        $group: {
          _id: "$color",
          count: { $sum: 1 },
          averagePrice: { $avg: "$price" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const clarityStats = await Diamond.aggregate([
      {
        $group: {
          _id: "$clarity",
          count: { $sum: 1 },
          averagePrice: { $avg: "$price" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalDiamonds: 0,
          totalValue: 0,
          averagePrice: 0,
          averageCarat: 0,
          availableCount: 0,
          soldCount: 0,
          reservedCount: 0,
        },
        byShape: shapeStats,
        byColor: colorStats,
        byClarity: clarityStats,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inventory statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update diamond status
export const updateDiamondStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid diamond ID",
      });
      return;
    }

    if (!["available", "sold", "reserved"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status. Must be available, sold, or reserved",
      });
      return;
    }

    const diamond = await Diamond.findByIdAndUpdate(
      id,
      { status, lastModified: new Date() },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!diamond) {
      res.status(404).json({
        success: false,
        message: "Diamond not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Diamond status updated successfully",
      data: diamond,
    });
  } catch (error) {
    console.error("Error updating diamond status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating diamond status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

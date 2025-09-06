"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDiamondStatus = exports.getInventoryStats = exports.bulkCreateDiamonds = exports.deleteDiamond = exports.updateDiamond = exports.createDiamond = exports.getDiamondBySku = exports.getDiamondById = exports.getDiamonds = void 0;
const Diamond_1 = require("../models/Diamond");
const mongoose_1 = __importDefault(require("mongoose"));
const getDiamonds = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = "-dateAdded", shape, cut, color, clarity, status, minCarat, maxCarat, minPrice, maxPrice, search, } = req.query;
        const filter = {};
        if (shape)
            filter.shape = shape;
        if (cut)
            filter.cut = cut;
        if (color)
            filter.color = color;
        if (clarity)
            filter.clarity = clarity;
        if (status)
            filter.status = status;
        if (minCarat || maxCarat) {
            filter.carat = {};
            if (minCarat)
                filter.carat.$gte = Number(minCarat);
            if (maxCarat)
                filter.carat.$lte = Number(maxCarat);
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice)
                filter.price.$gte = Number(minPrice);
            if (maxPrice)
                filter.price.$lte = Number(maxPrice);
        }
        if (search) {
            filter.$or = [
                { sku: { $regex: search, $options: "i" } },
                { certificateNumber: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const diamonds = await Diamond_1.Diamond.find(filter)
            .populate("createdBy", "name email")
            .sort(sort)
            .skip(skip)
            .limit(limitNum);
        const total = await Diamond_1.Diamond.countDocuments(filter);
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
    }
    catch (error) {
        console.error("Error fetching diamonds:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching diamonds",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getDiamonds = getDiamonds;
const getDiamondById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid diamond ID",
            });
            return;
        }
        const diamond = await Diamond_1.Diamond.findById(id).populate("createdBy", "name email");
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
    }
    catch (error) {
        console.error("Error fetching diamond:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching diamond",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getDiamondById = getDiamondById;
const getDiamondBySku = async (req, res) => {
    try {
        const { sku } = req.params;
        if (!sku) {
            res.status(400).json({
                success: false,
                message: "SKU is required",
            });
            return;
        }
        const diamond = await Diamond_1.Diamond.findOne({ sku: sku.toUpperCase() }).populate("createdBy", "name email");
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
    }
    catch (error) {
        console.error("Error fetching diamond by SKU:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching diamond",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getDiamondBySku = getDiamondBySku;
const createDiamond = async (req, res) => {
    try {
        const diamondData = {
            ...req.body,
            sku: req.body.sku?.toUpperCase(),
        };
        const existingSku = await Diamond_1.Diamond.findOne({ sku: diamondData.sku });
        if (existingSku) {
            res.status(400).json({
                success: false,
                message: "Diamond with this SKU already exists",
            });
            return;
        }
        const existingCert = await Diamond_1.Diamond.findOne({
            certificateNumber: req.body.certificateNumber,
        });
        if (existingCert) {
            res.status(400).json({
                success: false,
                message: "Diamond with this certificate number already exists",
            });
            return;
        }
        const diamond = new Diamond_1.Diamond(diamondData);
        await diamond.save();
        const populatedDiamond = await Diamond_1.Diamond.findById(diamond._id).populate("createdBy", "name email");
        res.status(201).json({
            success: true,
            message: "Diamond created successfully",
            data: populatedDiamond,
        });
    }
    catch (error) {
        console.error("Error creating diamond:", error);
        if (error instanceof mongoose_1.default.Error.ValidationError) {
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
exports.createDiamond = createDiamond;
const updateDiamond = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid diamond ID",
            });
            return;
        }
        const existingDiamond = await Diamond_1.Diamond.findById(id);
        if (!existingDiamond) {
            res.status(404).json({
                success: false,
                message: "Diamond not found",
            });
            return;
        }
        if (req.body.sku && req.body.sku.toUpperCase() !== existingDiamond.sku) {
            const existingSku = await Diamond_1.Diamond.findOne({
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
        if (req.body.certificateNumber &&
            req.body.certificateNumber !== existingDiamond.certificateNumber) {
            const existingCert = await Diamond_1.Diamond.findOne({
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
        const diamond = await Diamond_1.Diamond.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("createdBy", "name email");
        res.json({
            success: true,
            message: "Diamond updated successfully",
            data: diamond,
        });
    }
    catch (error) {
        console.error("Error updating diamond:", error);
        if (error instanceof mongoose_1.default.Error.ValidationError) {
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
exports.updateDiamond = updateDiamond;
const deleteDiamond = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid diamond ID",
            });
            return;
        }
        const diamond = await Diamond_1.Diamond.findByIdAndDelete(id);
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
    }
    catch (error) {
        console.error("Error deleting diamond:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting diamond",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteDiamond = deleteDiamond;
const bulkCreateDiamonds = async (req, res) => {
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
            createdBy: req.user.userId,
            sku: diamond.sku?.toUpperCase(),
        }));
        const createdDiamonds = await Diamond_1.Diamond.insertMany(diamondsData, {
            ordered: false,
        });
        res.status(201).json({
            success: true,
            message: `${createdDiamonds.length} diamonds created successfully`,
            data: createdDiamonds,
        });
    }
    catch (error) {
        console.error("Error bulk creating diamonds:", error);
        if (error.code === 11000) {
            const duplicateErrors = error.writeErrors?.filter((err) => err.code === 11000) || [];
            const otherErrors = error.writeErrors?.filter((err) => err.code !== 11000) || [];
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
exports.bulkCreateDiamonds = bulkCreateDiamonds;
const getInventoryStats = async (req, res) => {
    try {
        const stats = await Diamond_1.Diamond.aggregate([
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
        const shapeStats = await Diamond_1.Diamond.aggregate([
            {
                $group: {
                    _id: "$shape",
                    count: { $sum: 1 },
                    averagePrice: { $avg: "$price" },
                },
            },
            { $sort: { count: -1 } },
        ]);
        const colorStats = await Diamond_1.Diamond.aggregate([
            {
                $group: {
                    _id: "$color",
                    count: { $sum: 1 },
                    averagePrice: { $avg: "$price" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        const clarityStats = await Diamond_1.Diamond.aggregate([
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
    }
    catch (error) {
        console.error("Error fetching inventory stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching inventory statistics",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getInventoryStats = getInventoryStats;
const updateDiamondStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
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
        const diamond = await Diamond_1.Diamond.findByIdAndUpdate(id, { status, lastModified: new Date() }, { new: true, runValidators: true }).populate("createdBy", "name email");
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
    }
    catch (error) {
        console.error("Error updating diamond status:", error);
        res.status(500).json({
            success: false,
            message: "Error updating diamond status",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.updateDiamondStatus = updateDiamondStatus;
//# sourceMappingURL=diamondController.js.map
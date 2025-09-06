"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diamond = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const diamondSchema = new mongoose_1.Schema({
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    carat: {
        type: Number,
        required: true,
        min: 0.01,
        max: 50,
    },
    cut: {
        type: String,
        required: true,
        enum: ["Excellent", "Very Good", "Good", "Fair", "Poor"],
        trim: true,
    },
    color: {
        type: String,
        required: true,
        enum: [
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N",
            "O",
            "P",
            "Q",
            "R",
            "S",
            "T",
            "U",
            "V",
            "W",
            "X",
            "Y",
            "Z",
        ],
        trim: true,
    },
    clarity: {
        type: String,
        required: true,
        enum: [
            "FL",
            "IF",
            "VVS1",
            "VVS2",
            "VS1",
            "VS2",
            "SI1",
            "SI2",
            "I1",
            "I2",
            "I3",
        ],
        trim: true,
    },
    shape: {
        type: String,
        required: true,
        enum: [
            "Round",
            "Princess",
            "Emerald",
            "Asscher",
            "Marquise",
            "Oval",
            "Radiant",
            "Pear",
            "Heart",
            "Cushion",
        ],
        trim: true,
    },
    certificateNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    origin: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ["available", "sold", "reserved"],
        default: "available",
    },
    dimensions: {
        length: { type: Number, min: 0 },
        width: { type: Number, min: 0 },
        depth: { type: Number, min: 0 },
    },
    fluorescence: {
        type: String,
        enum: ["None", "Faint", "Medium", "Strong", "Very Strong"],
        default: "None",
    },
    polish: {
        type: String,
        enum: ["Excellent", "Very Good", "Good", "Fair", "Poor"],
        default: "Excellent",
    },
    symmetry: {
        type: String,
        enum: ["Excellent", "Very Good", "Good", "Fair", "Poor"],
        default: "Excellent",
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    images: [
        {
            type: String,
            trim: true,
        },
    ],
    dateAdded: {
        type: Date,
        default: Date.now,
    },
    lastModified: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
diamondSchema.index({ sku: 1 });
diamondSchema.index({ carat: 1, price: 1 });
diamondSchema.index({ shape: 1, cut: 1, color: 1, clarity: 1 });
diamondSchema.index({ status: 1 });
diamondSchema.index({ dateAdded: -1 });
diamondSchema.pre("save", function (next) {
    this.lastModified = new Date();
    next();
});
exports.Diamond = mongoose_1.default.model("Diamond", diamondSchema);
//# sourceMappingURL=Diamond.js.map
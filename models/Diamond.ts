import mongoose, { Document, Schema } from "mongoose";

export interface IDiamond extends Document {
  sku: string;
  carat: number;
  cut: string;
  color: string;
  clarity: string;
  shape: string;
  certificateNumber: string;
  origin: string;
  price: number;
  status: "available" | "sold" | "reserved";
  dimensions?: {
    length: number;
    width: number;
    depth: number;
  };
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  description?: string;
  images?: string[];
  dateAdded: Date;
  lastModified: Date;
  createdBy: mongoose.Types.ObjectId;
}

const diamondSchema = new Schema<IDiamond>(
  {
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
diamondSchema.index({ sku: 1 });
diamondSchema.index({ carat: 1, price: 1 });
diamondSchema.index({ shape: 1, cut: 1, color: 1, clarity: 1 });
diamondSchema.index({ status: 1 });
diamondSchema.index({ dateAdded: -1 });

// Update lastModified on save
diamondSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});

export const Diamond = mongoose.model<IDiamond>("Diamond", diamondSchema);

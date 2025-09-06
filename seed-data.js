const mongoose = require("mongoose");
require("dotenv").config();

// Diamond schema
const diamondSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true },
    carat: { type: Number, required: true },
    cut: { type: String, required: true },
    color: { type: String, required: true },
    clarity: { type: String, required: true },
    shape: { type: String, required: true },
    certificateNumber: { type: String, required: true },
    origin: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "sold", "reserved"],
      default: "available",
    },
    dimensions: {
      length: Number,
      width: Number,
      depth: Number,
    },
    fluorescence: String,
    polish: String,
    symmetry: String,
    description: String,
    images: [String],
    dateAdded: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Diamond = mongoose.model("Diamond", diamondSchema);

const sampleDiamonds = [
  {
    sku: "DMD001",
    carat: 1.5,
    cut: "Excellent",
    color: "D",
    clarity: "VVS1",
    shape: "Round",
    certificateNumber: "GIA-123456789",
    origin: "South Africa",
    price: 12500,
    status: "available",
    dimensions: { length: 7.5, width: 7.5, depth: 4.5 },
    fluorescence: "None",
    polish: "Excellent",
    symmetry: "Excellent",
    description: "Exceptional round brilliant diamond with perfect proportions",
  },
  {
    sku: "DMD002",
    carat: 2.0,
    cut: "Very Good",
    color: "E",
    clarity: "VS1",
    shape: "Princess",
    certificateNumber: "AGS-987654321",
    origin: "Canada",
    price: 18200,
    status: "available",
    dimensions: { length: 7.0, width: 7.0, depth: 5.2 },
    fluorescence: "Faint",
    polish: "Very Good",
    symmetry: "Very Good",
    description: "Beautiful princess cut with exceptional fire and brilliance",
  },
  {
    sku: "DMD003",
    carat: 1.8,
    cut: "Good",
    color: "F",
    clarity: "VS2",
    shape: "Oval",
    certificateNumber: "GIA-456789123",
    origin: "Botswana",
    price: 15600,
    status: "reserved",
    dimensions: { length: 8.2, width: 6.1, depth: 3.8 },
    fluorescence: "Medium",
    polish: "Good",
    symmetry: "Good",
    description: "Elegant oval diamond with excellent length-to-width ratio",
  },
  {
    sku: "DMD004",
    carat: 1.0,
    cut: "Excellent",
    color: "G",
    clarity: "SI1",
    shape: "Emerald",
    certificateNumber: "EGL-789123456",
    origin: "Russia",
    price: 8200,
    status: "sold",
    dimensions: { length: 6.8, width: 5.2, depth: 3.9 },
    fluorescence: "None",
    polish: "Excellent",
    symmetry: "Excellent",
    description:
      "Classic emerald cut with exceptional clarity and step-cut faceting",
  },
  {
    sku: "DMD005",
    carat: 2.5,
    cut: "Very Good",
    color: "H",
    clarity: "SI2",
    shape: "Cushion",
    certificateNumber: "GIA-321654987",
    origin: "Australia",
    price: 22000,
    status: "available",
    dimensions: { length: 8.5, width: 8.5, depth: 5.1 },
    fluorescence: "Strong",
    polish: "Very Good",
    symmetry: "Good",
    description: "Stunning cushion cut with vintage charm and modern precision",
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/diamond-inventory"
    );
    console.log("Connected to MongoDB");

    // Clear existing diamonds
    await Diamond.deleteMany({});
    console.log("Cleared existing diamonds");

    // Insert sample diamonds
    await Diamond.insertMany(sampleDiamonds);
    console.log("Sample diamonds inserted successfully");

    // Get count
    const count = await Diamond.countDocuments();
    console.log(`Total diamonds in database: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();

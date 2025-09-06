import mongoose, { Document } from "mongoose";
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
export declare const Diamond: mongoose.Model<IDiamond, {}, {}, {}, mongoose.Document<unknown, {}, IDiamond, {}, {}> & IDiamond & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Diamond.d.ts.map
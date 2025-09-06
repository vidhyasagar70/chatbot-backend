import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getDiamonds: (req: Request, res: Response) => Promise<void>;
export declare const getDiamondById: (req: Request, res: Response) => Promise<void>;
export declare const getDiamondBySku: (req: Request, res: Response) => Promise<void>;
export declare const createDiamond: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateDiamond: (req: Request, res: Response) => Promise<void>;
export declare const deleteDiamond: (req: Request, res: Response) => Promise<void>;
export declare const bulkCreateDiamonds: (req: Request, res: Response) => Promise<void>;
export declare const getInventoryStats: (req: Request, res: Response) => Promise<void>;
export declare const updateDiamondStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=diamondController.d.ts.map
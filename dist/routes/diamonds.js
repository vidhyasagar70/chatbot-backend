"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const diamondController_1 = require("../controllers/diamondController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get("/", diamondController_1.getDiamonds);
router.get("/stats", diamondController_1.getInventoryStats);
router.get("/sku/:sku", diamondController_1.getDiamondBySku);
router.get("/:id", diamondController_1.getDiamondById);
router.post("/", diamondController_1.createDiamond);
router.post("/bulk", diamondController_1.bulkCreateDiamonds);
router.put("/:id", diamondController_1.updateDiamond);
router.put("/:id/status", diamondController_1.updateDiamondStatus);
router.delete("/:id", diamondController_1.deleteDiamond);
exports.default = router;
//# sourceMappingURL=diamonds.js.map
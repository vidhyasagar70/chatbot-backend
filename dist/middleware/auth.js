"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "No token provided." });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token || typeof token !== "string") {
        res.status(401).json({ message: "Token missing or invalid." });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof decoded === "object" &&
            decoded &&
            "userId" in decoded &&
            "role" in decoded) {
            req.user = {
                userId: decoded.userId,
                role: decoded.role,
            };
            next();
            return;
        }
        else {
            res.status(401).json({ message: "Invalid token payload." });
            return;
        }
    }
    catch (err) {
        res.status(401).json({ message: "Invalid token." });
        return;
    }
};
exports.authenticate = authenticate;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: "Access denied." });
            return;
        }
        next();
        return;
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=auth.js.map
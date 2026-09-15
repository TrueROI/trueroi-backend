"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const db_1 = __importDefault(require("../utils/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// REGISTER USER
const register = async (req, res) => {
    console.log("📩 REGISTER CONTROLLER HIT");
    console.log("➡️ Incoming body:", req.body);
    try {
        const { email, password } = req.body;
        console.log("🔍 Validating input...");
        if (!email || !password) {
            console.log("❌ Missing email or password");
            return res.status(400).json({ message: "Email and password required" });
        }
        console.log("🔎 Checking if user exists:", email);
        const existingUser = await db_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            console.log("⚠️ User already exists:", email);
            return res.status(409).json({ message: "User already exists" });
        }
        console.log("🔐 Hashing password...");
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        console.log("🛠 Creating user in database...");
        const user = await db_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
        console.log("✅ User created:", user.email);
        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.error("❌ Register error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.register = register;
// LOGIN USER
const login = async (req, res) => {
    console.log("🔐 LOGIN CONTROLLER HIT");
    console.log("➡️ Incoming body:", req.body);
    try {
        const { email, password } = req.body;
        console.log("🔍 Validating input...");
        if (!email || !password) {
            console.log("❌ Missing email or password");
            return res.status(400).json({ message: "Email and password required" });
        }
        console.log("🔎 Looking up user:", email);
        const user = await db_1.default.user.findUnique({
            where: { email },
        });
        console.log("🔎 User lookup result:", user);
        if (!user) {
            console.log("❌ No user found with email:", email);
            return res.status(400).json({ message: "Invalid email or password" });
        }
        console.log("🔐 Comparing passwords...");
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Password mismatch for:", email);
            return res.status(400).json({ message: "Invalid email or password" });
        }
        console.log("🔑 Creating JWT...");
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        console.log("✅ Login successful:", email);
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.error("❌ Login error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.login = login;

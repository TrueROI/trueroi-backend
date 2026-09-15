import { Request, Response } from "express";
import prisma from "../utils/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER USER
export const register = async (req: Request, res: Response) => {
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
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("⚠️ User already exists:", email);
      return res.status(409).json({ message: "User already exists" });
    }

    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("🛠 Creating user in database...");
    const user = await prisma.user.create({
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
  } catch (error: any) {
    console.error("❌ Register error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// LOGIN USER
export const login = async (req: Request, res: Response) => {
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
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("🔎 User lookup result:", user);

    if (!user) {
      console.log("❌ No user found with email:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("🔐 Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("❌ Password mismatch for:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("🔑 Creating JWT...");
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

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
  } catch (error: any) {
    console.error("❌ Login error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

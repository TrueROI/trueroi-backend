console.log("SERVER STARTING...");
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index";
import prisma from "./utils/db";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

app.use("/api", routes);

// Connect to database
prisma.$connect()
    .then(() => console.log("Connected to database"))
    .catch((err: unknown) => console.error("DB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
console.log("SERVER FILE LOADED FROM:", __filename);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.get("/health/db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

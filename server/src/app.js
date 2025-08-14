import "dotenv/config.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { pingDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRouter);

app.get("/health", async (_req, res) => {
  try {
    await pingDB();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`EDUSIS listening on http://localhost:${port}`);
});

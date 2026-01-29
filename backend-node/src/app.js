import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { errorHandler, notFound } from "./middlewares/error.js";
import authRoutes from "./routes/auth.js";
import goodsRoutes from "./routes/goods.js";
import boosterRoutes from "./routes/booster.js";
import userRoutes from "./routes/user.js";
import orderRoutes from "./routes/order.js";
import homeRoutes from "./routes/home.js";
import uploadRoutes from "./routes/upload.js";

export function createApp({ config, db, cos }) {
  const app = express();

  // Security & Utils
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(morgan("dev")); // Logger
  app.use(express.json({ limit: "2mb" }));

  // Health check
  app.get("/healthz", async (_req, res) => {
    try {
      await db.execute("SELECT 1");
      res.json({ ok: true, db: true });
    } catch (e) {
      res.status(500).json({ ok: false, db: false });
    }
  });

  // API Routes
  const api = express.Router();
  
  api.use("/auth", authRoutes);
  api.use("/goods", goodsRoutes);
  api.use("/booster", boosterRoutes);
  api.use("/user", userRoutes);
  api.use("/order", orderRoutes);
  api.use("/home", homeRoutes);
  api.use("/upload", uploadRoutes);

  app.use("/api", api);

  // Error Handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

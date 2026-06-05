import cors from "cors";
import express from "express";
import { CORS_ORIGIN } from "./config/server.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
    })
  );
  app.use(express.json());

  app.use(apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { message: "요청한 경로를 찾을 수 없습니다." },
    });
  });

  app.use(errorHandler);

  return app;
}

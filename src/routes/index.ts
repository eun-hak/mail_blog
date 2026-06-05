import { Router } from "express";
import { API_PREFIX } from "../config/server.js";
import { articlesRouter } from "./articles.routes.js";
import { authRouter } from "./auth.routes.js";
import { emailsRouter } from "./emails.routes.js";
import { healthRouter } from "./health.routes.js";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(`${API_PREFIX}/emails`, emailsRouter);
apiRouter.use(`${API_PREFIX}/articles`, articlesRouter);
apiRouter.use(`${API_PREFIX}/auth`, authRouter);

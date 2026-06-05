import { Router } from "express";
import {
  listArticles,
  listExampleArticles,
} from "../controllers/articles.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const articlesRouter = Router();

articlesRouter.get("/example", asyncHandler(listExampleArticles));
articlesRouter.get("/", asyncHandler(listArticles));

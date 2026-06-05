import { Router } from "express";
import { getAuthStatus } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const authRouter = Router();

authRouter.get("/status", asyncHandler(getAuthStatus));

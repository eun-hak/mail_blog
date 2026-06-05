import { Router } from "express";
import { listEmails, syncEmails } from "../controllers/emails.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const emailsRouter = Router();

emailsRouter.get("/", asyncHandler(listEmails));
emailsRouter.post("/sync", asyncHandler(syncEmails));

import { Router } from "express";
import express from "express";
import { getGeneratedImagesDir } from "../services/nvidiaImage.service.js";

export const mediaRouter = Router();

mediaRouter.use(
  "/images",
  express.static(getGeneratedImagesDir(), {
    maxAge: "7d",
    fallthrough: false,
  })
);

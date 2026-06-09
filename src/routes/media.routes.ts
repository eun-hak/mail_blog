import { Router } from "express";
import express from "express";
import { getGeneratedImagesDir } from "../services/nvidiaImage.service.js";

export const mediaRouter = Router();

mediaRouter.use(
  "/images",
  express.static(getGeneratedImagesDir(), {
    maxAge: process.env.NODE_ENV === "production" ? "7d" : 0,
    fallthrough: false,
    etag: true,
  })
);

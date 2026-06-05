import fs from "node:fs/promises";
import type { Request, Response } from "express";
import { CREDENTIALS_PATH, TOKEN_PATH } from "../config/gmail.js";
import { getAuthenticatedClient } from "../services/gmailAuth.service.js";
import type { ApiSuccessResponse } from "../types/api.types.js";

type AuthStatus = {
  credentialsPresent: boolean;
  tokenPresent: boolean;
  authenticated: boolean;
};

async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export async function getAuthStatus(_req: Request, res: Response): Promise<void> {
  const credentialsPresent = await fileExists(CREDENTIALS_PATH);
  const tokenPresent = await fileExists(TOKEN_PATH);

  let authenticated = false;

  if (credentialsPresent && tokenPresent) {
    try {
      await getAuthenticatedClient();
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  const body: ApiSuccessResponse<AuthStatus> = {
    success: true,
    data: { credentialsPresent, tokenPresent, authenticated },
  };

  res.json(body);
}

import fs from "node:fs/promises";
import http from "node:http";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { URL } from "node:url";
import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import {
  CREDENTIALS_PATH,
  GMAIL_SCOPES,
  TOKEN_PATH,
} from "../config/gmail.js";
import type {
  CredentialsFile,
  OAuthClientConfig,
  TokenFile,
} from "../types/email.types.js";

const execAsync = promisify(exec);

/** Web OAuth 클라이언트용 고정 리디렉션 URI (Google Cloud에 동일하게 등록 필요) */
export const WEB_OAUTH_REDIRECT_URI =
  "http://localhost:3000/oauth2callback";

const OAUTH_CALLBACK_PATH = "/oauth2callback";

class GmailAuthError extends Error {
  constructor(
    message: string,
    public readonly step: string,
    public readonly hint?: string
  ) {
    super(message);
    this.name = "GmailAuthError";
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isInstalledClient(credentials: CredentialsFile): boolean {
  return Boolean(credentials.installed);
}

function getOAuthClientConfig(credentials: CredentialsFile): OAuthClientConfig {
  const config = credentials.installed ?? credentials.web;
  if (!config?.client_id || !config?.client_secret) {
    throw new GmailAuthError(
      "credentials.json에 installed 또는 web 클라이언트 정보가 없습니다.",
      "parse_credentials"
    );
  }
  return config;
}

export function describeCredentialsSetup(
  credentials: CredentialsFile
): string {
  if (isInstalledClient(credentials)) {
    return [
      "OAuth 클라이언트 유형: 데스크톱 앱 (installed)",
      "브라우저 인증 시 동적 localhost 포트를 사용합니다.",
      "Google Cloud Console에서 '데스크톱 앱' 클라이언트 JSON을 사용 중인지 확인하세요.",
    ].join("\n");
  }

  return [
    "OAuth 클라이언트 유형: 웹 애플리케이션 (web) — credentials.json에 web 키만 있습니다.",
    "Google Cloud Console → API 및 서비스 → 사용자 인증 정보 → 해당 OAuth 클라이언트 편집",
    `→ '승인된 리디렉션 URI'에 아래 주소를 정확히 추가하세요:`,
    `   ${WEB_OAUTH_REDIRECT_URI}`,
    "",
    "권장: 'Gmail Parser Local' 데스크톱 앱 클라이언트 JSON을 다시 다운로드해",
    "credentials.json을 교체하면 redirect URI 설정 없이 동작하는 경우가 많습니다.",
  ].join("\n");
}

async function readCredentialsFile(): Promise<CredentialsFile> {
  if (!(await fileExists(CREDENTIALS_PATH))) {
    throw new GmailAuthError(
      `credentials.json을 찾을 수 없습니다. 프로젝트 루트(${CREDENTIALS_PATH})에 Google Cloud에서 다운로드한 OAuth 클라이언트 JSON을 배치하세요.`,
      "credentials_missing"
    );
  }

  try {
    const raw = await fs.readFile(CREDENTIALS_PATH, "utf-8");
    return JSON.parse(raw) as CredentialsFile;
  } catch (error) {
    throw new GmailAuthError(
      `credentials.json 읽기 실패: ${error instanceof Error ? error.message : String(error)}`,
      "read_credentials"
    );
  }
}

function createOAuth2Client(
  credentials: CredentialsFile,
  redirectUri: string
): OAuth2Client {
  const config = getOAuthClientConfig(credentials);
  return new google.auth.OAuth2(
    config.client_id,
    config.client_secret,
    redirectUri
  );
}

function buildRedirectUri(
  credentials: CredentialsFile,
  port: number
): string {
  const config = getOAuthClientConfig(credentials);

  if (isInstalledClient(credentials)) {
    const configured = config.redirect_uris?.[0];
    if (configured) {
      const url = new URL(configured);
      url.port = String(port);
      if (!url.pathname || url.pathname === "/") {
        url.pathname = OAUTH_CALLBACK_PATH;
      }
      return url.toString();
    }
    return `http://127.0.0.1:${port}${OAUTH_CALLBACK_PATH}`;
  }

  return WEB_OAUTH_REDIRECT_URI;
}

async function openBrowser(url: string): Promise<void> {
  const platform = process.platform;
  const command =
    platform === "darwin"
      ? `open "${url}"`
      : platform === "win32"
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;

  try {
    await execAsync(command);
  } catch {
    console.log(`브라우저를 자동으로 열지 못했습니다. 아래 URL을 직접 열어주세요:\n${url}\n`);
  }
}

async function loadToken(): Promise<TokenFile | null> {
  if (!(await fileExists(TOKEN_PATH))) {
    return null;
  }

  try {
    const raw = await fs.readFile(TOKEN_PATH, "utf-8");
    return JSON.parse(raw) as TokenFile;
  } catch (error) {
    throw new GmailAuthError(
      `token.json 읽기 실패: ${error instanceof Error ? error.message : String(error)}`,
      "read_token"
    );
  }
}

async function saveToken(
  client: OAuth2Client,
  credentials: CredentialsFile
): Promise<void> {
  const config = getOAuthClientConfig(credentials);
  const creds = client.credentials;

  const token: TokenFile = {
    type: "authorized_user",
    client_id: config.client_id,
    client_secret: config.client_secret,
    refresh_token: creds.refresh_token ?? undefined,
    access_token: creds.access_token ?? undefined,
    scope: creds.scope ?? GMAIL_SCOPES.join(" "),
    token_type: creds.token_type ?? "Bearer",
    expiry_date: creds.expiry_date ?? undefined,
  };

  await fs.writeFile(TOKEN_PATH, JSON.stringify(token, null, 2), "utf-8");
}

async function authorizeWithBrowser(): Promise<OAuth2Client> {
  const credentials = await readCredentialsFile();
  const installed = isInstalledClient(credentials);
  const listenPort = installed ? 0 : 3000;
  const listenHost = installed ? "127.0.0.1" : "localhost";

  console.log(describeCredentialsSetup(credentials));
  console.log("");

  return new Promise((resolve, reject) => {
    let redirectUri = "";

    const server = http.createServer(async (req, res) => {
      try {
        const requestUrl = new URL(
          req.url ?? "/",
          `http://${listenHost}:${redirectUri ? new URL(redirectUri).port : listenPort}`
        );

        if (requestUrl.pathname !== OAUTH_CALLBACK_PATH) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }

        const errorParam = requestUrl.searchParams.get("error");
        if (errorParam) {
          res.writeHead(400);
          res.end(`인증 실패: ${errorParam}`);
          reject(
            new GmailAuthError(
              `Google OAuth 오류: ${errorParam}`,
              "browser_auth",
              errorParam === "redirect_uri_mismatch"
                ? describeCredentialsSetup(credentials)
                : undefined
            )
          );
          return;
        }

        const code = requestUrl.searchParams.get("code");
        if (!code) {
          res.writeHead(400);
          res.end("인증 코드가 없습니다.");
          reject(
            new GmailAuthError("인증 코드를 받지 못했습니다.", "browser_auth")
          );
          return;
        }

        const client = createOAuth2Client(credentials, redirectUri);
        const { tokens } = await client.getToken({ code, redirect_uri: redirectUri });
        client.setCredentials(tokens);

        if (!tokens.refresh_token && !tokens.access_token) {
          reject(
            new GmailAuthError(
              "브라우저 인증 후 토큰을 받지 못했습니다.",
              "browser_auth"
            )
          );
          return;
        }

        await saveToken(client, credentials);

        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          "<html><body><h2>인증 성공</h2><p>이 창을 닫고 터미널로 돌아가세요.</p></body></html>"
        );
        resolve(client);
      } catch (error) {
        reject(
          error instanceof GmailAuthError
            ? error
            : new GmailAuthError(
                `토큰 교환 실패: ${error instanceof Error ? error.message : String(error)}`,
                "token_exchange"
              )
        );
      } finally {
        server.close();
      }
    });

    server.on("error", (error) => {
      reject(
        new GmailAuthError(
          `로컬 인증 서버 시작 실패: ${error.message}`,
          "local_server"
        )
      );
    });

    server.listen(listenPort, listenHost, async () => {
      const address = server.address();
      const port =
        typeof address === "object" && address?.port ? address.port : listenPort;

      redirectUri = buildRedirectUri(credentials, port);
      const client = createOAuth2Client(credentials, redirectUri);

      const authUrl = client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: GMAIL_SCOPES,
        redirect_uri: redirectUri,
      });

      console.log(`리디렉션 URI: ${redirectUri}`);
      console.log("브라우저에서 Google 계정 인증을 진행합니다...\n");
      await openBrowser(authUrl);
    });
  });
}

function applyTokenToClient(client: OAuth2Client, token: TokenFile): void {
  client.setCredentials({
    refresh_token: token.refresh_token,
    access_token: token.access_token,
    scope: token.scope,
    token_type: token.token_type,
    expiry_date: token.expiry_date,
  });
}

async function authorizeFromSavedToken(
  credentials: CredentialsFile,
  token: TokenFile
): Promise<OAuth2Client> {
  const redirectUri = isInstalledClient(credentials)
    ? (getOAuthClientConfig(credentials).redirect_uris?.[0] ??
      "http://127.0.0.1")
    : WEB_OAUTH_REDIRECT_URI;

  const client = createOAuth2Client(credentials, redirectUri);
  applyTokenToClient(client, token);

  try {
    const accessToken = await client.getAccessToken();
    if (!accessToken.token) {
      throw new Error("access token 없음");
    }
  } catch (error) {
    throw new GmailAuthError(
      `저장된 token.json이 만료되었거나 유효하지 않습니다. token.json을 삭제한 뒤 다시 실행하세요. (${error instanceof Error ? error.message : String(error)})`,
      "refresh_token"
    );
  }

  return client;
}

export async function getAuthenticatedClient(): Promise<OAuth2Client> {
  const credentials = await readCredentialsFile();
  const savedToken = await loadToken();

  if (savedToken) {
    return authorizeFromSavedToken(credentials, savedToken);
  }

  console.log("token.json이 없습니다. 브라우저 OAuth 인증을 시작합니다...\n");
  return authorizeWithBrowser();
}

export { GmailAuthError };

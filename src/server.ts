import "dotenv/config";
import { createApp } from "./app.js";
import { SERVER_PORT } from "./config/server.js";

const app = createApp();

app.listen(SERVER_PORT, () => {
  console.log(`mail-blog API 서버 실행 중: http://localhost:${SERVER_PORT}`);
  console.log(`  Health:  http://localhost:${SERVER_PORT}/health`);
  console.log(`  Emails:    http://localhost:${SERVER_PORT}/api/emails`);
  console.log(`  Articles:  http://localhost:${SERVER_PORT}/api/articles`);
  console.log(`  Example:   http://localhost:${SERVER_PORT}/api/articles/example`);
  console.log(`  Auth:      http://localhost:${SERVER_PORT}/api/auth/status`);
});

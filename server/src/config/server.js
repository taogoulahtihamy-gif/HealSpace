import http from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { initializeSocketServer } from "./sockets/socket.server.js";

const httpServer = http.createServer(app);

initializeSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`HealSpace API running on port ${env.PORT}`);
});

import { bootstrap } from "./bootstrap.js";
import { config } from "./config.js";

const application = bootstrap();
const server = application.app.listen(config.PORT, "0.0.0.0");

const shutdown = () =>
  server.close(async () => {
    await application.close();
    process.exit(0);
  });

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);

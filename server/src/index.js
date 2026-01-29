import "dotenv/config";
import { loadConfig } from "./config.js";
import { createDbPool } from "./db.js";
import { createCosClient } from "./cos.js";
import { createApp } from "./app.js";

const config = loadConfig(process.env);
const db = createDbPool(config.mysql);
const cos = createCosClient(config.cos);

const app = createApp({ config, db, cos });

app.listen(config.port, () => {
  process.stdout.write(`api listening on :${config.port}\n`);
});


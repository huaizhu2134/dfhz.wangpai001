import "dotenv/config";
import { loadConfig } from "./config.js";
import { getDb } from "./db.js";
import { createCosClient } from "./cos.js";
import { createApp } from "./app.js";

const config = loadConfig(process.env);

// Initialize DB Pool
// db.js loads config internally, so getDb() uses the environment variables
const db = getDb();

// Initialize COS
const cos = createCosClient(config.cos);

const app = createApp({ config, db, cos });

app.listen(config.port, () => {
  console.log(`Backend listening on port ${config.port}`);
});

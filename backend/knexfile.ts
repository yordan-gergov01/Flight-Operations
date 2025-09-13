import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import type { Knex } from "knex";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    seeds: {
      directory: path.join(__dirname, "src", "seeds"),
      extension: "ts",
      loadExtensions: [".ts"],
    },
  },
};

export default config;

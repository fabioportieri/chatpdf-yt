import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";
dotenv.config({ path: ".env" });

export default {
  driver: "pg",
  schema: "./src/lib/db/schema.ts",
  verbose: true,
  dbCredentials: {
    connectionString: process.env.DATABASE_URL ?? "fdfsdfsdfdsfdsf",
  },
} satisfies Config;

// npx drizzle-kit push:pg

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
config({ path: ".env" });
// const TURSO_CONNECTION_URL = "libsql://db-prusvladyslav.turso.io";
// const TURSO_AUTH_TOKEN =
//   "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MjY0ODQzMDksImlkIjoiMDIxZjdjMTUtZTk5OC00MTA0LTlmMmYtOGJiMmFjZWE0OTNlIn0.n7b8sdapqrDw6itP5j6Xk3umMmmIEjiA5jMiOnDQxfXTgdW6qrqHXoRq-B41dj1HhyOg51n2IrUT8ntWiVqkAQ";
const client = createClient({
  // url: TURSO_CONNECTION_URL!,
  // authToken: TURSO_AUTH_TOKEN!,
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });

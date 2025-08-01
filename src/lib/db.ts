import { drizzle } from "drizzle-orm/libsql";
import env from "src/lib/env";
const db = drizzle(env.DB_FILE_NAME);

export default db;

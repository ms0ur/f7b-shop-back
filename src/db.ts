import { Database } from "bun:sqlite";

const db = new Database("shopBack.sqlite", { create: true, strict: true });
db.run("PRAGMA journal_mode = WAL;");

export default db
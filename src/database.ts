import { DataSource } from "typeorm";
import { Message } from "./entity/Message";

const dbPath = process.env.DB_PATH ?? "bot.db";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: dbPath,
  synchronize: true,
  entities: [Message],
});

export async function initDatabase(): Promise<DataSource> {
  await AppDataSource.initialize();
  console.log("Database connected");
  return AppDataSource;
}

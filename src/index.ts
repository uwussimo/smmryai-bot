import "reflect-metadata";
import "dotenv/config";
import { initDatabase } from "./database";
import { createBot } from "./bot";

const BOT_TOKEN = process.env.BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!BOT_TOKEN) {
	console.error("Missing BOT_TOKEN in .env");
	process.exit(1);
}
if (!OPENAI_API_KEY) {
	console.error("Missing OPENAI_API_KEY in .env");
	process.exit(1);
}

async function main() {
	await initDatabase();

	const bot = createBot(BOT_TOKEN!, OPENAI_API_KEY!);

	bot.catch((err) => {
		console.error("Bot error:", err);
	});

	console.log("Bot is running...");
	bot.start();
}

main();

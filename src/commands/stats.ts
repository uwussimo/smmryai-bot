import { Composer, Context } from "grammy";
import { messageRepo } from "../helpers/messages";
import { getMAU } from "../helpers/analytics";

const adminIds = (process.env.ADMIN_IDS ?? "")
	.split(",")
	.map((id) => parseInt(id.trim(), 10))
	.filter((id) => !isNaN(id));

export function statsCommand(): Composer<Context> {
	const composer = new Composer<Context>();

	composer.command("stats", async (ctx) => {
		const chatId = ctx.chat?.id;
		if (!chatId) return;

		const userId = ctx.from?.id;
		const total = await messageRepo().count({ where: { chatId } });

		let text = `I have ${total} messages recorded in this chat.`;

		if (userId && adminIds.includes(userId)) {
			const mau = await getMAU();
			text += `\n\n--- Admin ---\nMAU (30d): ${mau} users`;
		}

		await ctx.reply(text);
	});

	return composer;
}

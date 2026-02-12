import { Composer, Context } from "grammy";
import { saveMessage } from "../helpers/messages";
import { trackUserGroup } from "../helpers/groups";

export function messageRecorder(): Composer<Context> {
	const composer = new Composer<Context>();

	// Track user-group membership on every message (text, sticker, etc.)
	composer.on("message", async (ctx, next) => {
		const chat = ctx.chat;
		const from = ctx.from;
		if (from && (chat.type === "group" || chat.type === "supergroup")) {
			await trackUserGroup(
				from.id,
				chat.id,
				from.username ??
					[from.first_name, from.last_name].filter(Boolean).join(" "),
				chat.title ?? "Unknown Group",
			);
		}
		await next();
	});

	composer.on("message:text", async (ctx, next) => {
		if (!ctx.message.text.startsWith("/")) {
			await saveMessage(ctx.message, ctx.message.text);
		}
		await next();
	});

	composer.on("message:sticker", async (ctx, next) => {
		const sticker = ctx.message.sticker;
		const emoji = sticker.emoji ?? "sticker";
		await saveMessage(ctx.message, `[${emoji} sticker]`);
		await next();
	});

	return composer;
}

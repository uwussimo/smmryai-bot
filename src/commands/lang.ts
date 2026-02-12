import { Composer, Context, InlineKeyboard } from "grammy";
import { getUserLanguage } from "../helpers/settings";

const LANG_LABELS: Record<string, string> = {
	en: "English",
	ru: "Русский",
	uz: "O'zbek",
};

export function langCommand(): Composer<Context> {
	const composer = new Composer<Context>();

	composer.command("lang", async (ctx) => {
		const userId = ctx.from?.id;
		if (!userId) return;

		const current = await getUserLanguage(userId);
		const keyboard = new InlineKeyboard();

		for (const [code, label] of Object.entries(LANG_LABELS)) {
			const marker = code === current ? " ✓" : "";
			keyboard.text(`${label}${marker}`, `lang:${code}`).row();
		}

		await ctx.reply("Choose your summary language:", {
			reply_markup: keyboard,
		});
	});

	return composer;
}

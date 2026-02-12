import { Composer, Context } from "grammy";
import { Like } from "typeorm";
import OpenAI from "openai";
import { messageRepo, buildTranscript } from "../helpers/messages";
import { askGPT, TOPIC_PROMPT } from "../helpers/openai";
import {
	getUserGroups,
	buildGroupKeyboard,
	buildFollowUpKeyboard,
	isDM,
} from "../helpers/groups";
import { checkUsageLimit, incrementUsage } from "../helpers/premium";
import { getUserLanguage } from "../helpers/settings";

export async function runTopic(
	ctx: Context,
	openai: OpenAI,
	targetChatId: number,
	query: string,
): Promise<void> {
	const messages = await messageRepo().find({
		where: { chatId: targetChatId, text: Like(`%${query}%`) },
		order: { date: "DESC" },
		take: 200,
	});

	if (messages.length === 0) {
		await ctx.reply(`No messages found about "${query}".`);
		return;
	}

	const lang = await getUserLanguage(ctx.from?.id ?? 0);
	const transcript = buildTranscript(messages.reverse());
	const statusMsg = await ctx.reply(
		`Searching ${messages.length} messages about "${query}"...`,
	);

	try {
		const result = await askGPT(
			openai,
			TOPIC_PROMPT,
			`What did the group say about "${query}"? Here are the relevant messages:\n\n${transcript}`,
			lang,
		);
		if (isDM(ctx)) {
			await ctx.api.editMessageText(
				ctx.chat!.id,
				statusMsg.message_id,
				result,
				{
					reply_markup: buildFollowUpKeyboard(targetChatId),
				},
			);
		} else {
			await ctx.api.editMessageText(ctx.chat!.id, statusMsg.message_id, result);
		}
	} catch (err) {
		console.error("OpenAI error:", err);
		await ctx.api.editMessageText(
			ctx.chat!.id,
			statusMsg.message_id,
			"Failed to search topic. Please try again later.",
		);
	}
}

export function topicCommand(openai: OpenAI): Composer<Context> {
	const composer = new Composer<Context>();

	composer.command("topic", async (ctx) => {
		const chatId = ctx.chat?.id;
		if (!chatId) return;

		const userId = ctx.from?.id;
		if (!userId) return;

		const query = ctx.message?.text?.split(" ").slice(1).join(" ")?.trim();
		if (!query) {
			await ctx.reply("Usage: /topic <keyword>\nExample: /topic crypto");
			return;
		}

		// Premium check
		const allowed = await checkUsageLimit(userId);
		if (allowed !== true) {
			await ctx.reply(allowed);
			return;
		}

		if (ctx.chat.type !== "private") {
			await incrementUsage(userId);
			await runTopic(ctx, openai, chatId, query);
			return;
		}

		const groups = await getUserGroups(userId);
		if (groups.length === 0) {
			await ctx.reply("I haven't seen you in any groups yet.");
			return;
		}

		if (groups.length === 1) {
			await incrementUsage(userId);
			await runTopic(ctx, openai, groups[0].chatId, query);
			return;
		}

		const keyboard = buildGroupKeyboard(groups, `topic:${query}`);
		await ctx.reply("Which group do you want to search?", {
			reply_markup: keyboard,
		});
	});

	return composer;
}

import { Composer, Context } from "grammy";
import { Like } from "typeorm";
import OpenAI from "openai";
import { messageRepo, buildTranscript } from "../helpers/messages";
import { askGPT, TOPIC_PROMPT } from "../helpers/openai";

export function topicCommand(openai: OpenAI): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("topic", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const query = ctx.message?.text?.split(" ").slice(1).join(" ")?.trim();
    if (!query) {
      await ctx.reply("Usage: /topic <keyword>\nExample: /topic crypto");
      return;
    }

    const messages = await messageRepo().find({
      where: { chatId, text: Like(`%${query}%`) },
      order: { date: "DESC" },
      take: 200,
    });

    if (messages.length === 0) {
      await ctx.reply(`No messages found about "${query}".`);
      return;
    }

    const transcript = buildTranscript(messages.reverse());
    const statusMsg = await ctx.reply(`Searching ${messages.length} messages about "${query}"...`);

    try {
      const result = await askGPT(
        openai,
        TOPIC_PROMPT,
        `What did the group say about "${query}"? Here are the relevant messages:\n\n${transcript}`,
      );
      await ctx.api.editMessageText(chatId, statusMsg.message_id, result);
    } catch (err) {
      console.error("OpenAI error:", err);
      await ctx.api.editMessageText(chatId, statusMsg.message_id, "Failed to search topic. Please try again later.");
    }
  });

  return composer;
}

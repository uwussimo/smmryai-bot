import { Composer, Context } from "grammy";
import OpenAI from "openai";
import { parseTimeArg } from "../helpers/time";
import { fetchMessages, buildTranscript } from "../helpers/messages";
import { askGPT, WHOSAID_PROMPT } from "../helpers/openai";

export function whosaidCommand(openai: OpenAI): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("whosaid", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const parts = ctx.message?.text?.split(" ");
    const rawUsername = parts?.[1]?.replace(/^@/, "");
    if (!rawUsername) {
      await ctx.reply("Usage: /whosaid <username> [time]\nExamples:\n/whosaid usufdev\n/whosaid jamshid 2h");
      return;
    }

    const timeArg = parseTimeArg(parts?.[2]);
    const messages = await fetchMessages(chatId, timeArg, { username: rawUsername });

    if (messages.length === 0) {
      await ctx.reply(`No messages found from @${rawUsername}.`);
      return;
    }

    const transcript = buildTranscript(messages);
    const statusMsg = await ctx.reply(`Summarizing ${messages.length} messages from @${rawUsername}...`);

    try {
      const result = await askGPT(
        openai,
        WHOSAID_PROMPT,
        `Summarize what @${rawUsername} said in these ${messages.length} messages:\n\n${transcript}`,
      );
      await ctx.api.editMessageText(chatId, statusMsg.message_id, result);
    } catch (err) {
      console.error("OpenAI error:", err);
      await ctx.api.editMessageText(chatId, statusMsg.message_id, "Failed to generate summary. Please try again later.");
    }
  });

  return composer;
}

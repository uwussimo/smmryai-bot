import { Composer, Context } from "grammy";
import OpenAI from "openai";
import { parseTimeArg } from "../helpers/time";
import { fetchMessages, buildTranscript } from "../helpers/messages";
import { askGPT, SUMMARY_PROMPT } from "../helpers/openai";

export function summaryCommand(openai: OpenAI): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("summary", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const arg = ctx.message?.text?.split(" ")[1];
    const timeArg = parseTimeArg(arg);
    const messages = await fetchMessages(chatId, timeArg);

    if (messages.length === 0) {
      await ctx.reply("No messages recorded yet. I need to observe some chat first!");
      return;
    }

    const transcript = buildTranscript(messages);
    const statusMsg = await ctx.reply(`Summarizing ${messages.length} messages...`);

    try {
      const summary = await askGPT(
        openai,
        SUMMARY_PROMPT,
        `Summarize the following ${messages.length} messages from a group chat:\n\n${transcript}`,
      );
      await ctx.api.editMessageText(chatId, statusMsg.message_id, summary);
    } catch (err) {
      console.error("OpenAI error:", err);
      await ctx.api.editMessageText(chatId, statusMsg.message_id, "Failed to generate summary. Please try again later.");
    }
  });

  return composer;
}

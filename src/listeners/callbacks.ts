import { Composer, Context } from "grammy";
import OpenAI from "openai";
import { runSummary } from "../commands/summary";
import { runTopic } from "../commands/topic";
import { runWhosaid } from "../commands/whosaid";

export function callbackHandler(openai: OpenAI): Composer<Context> {
  const composer = new Composer<Context>();

  composer.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery();

    // Delete the "Which group?" message with buttons
    try {
      await ctx.deleteMessage();
    } catch {
      // ignore if already deleted
    }

    // Parse callback data: "command:args:chatId"
    // summary:2h:-123456
    // topic:crypto:-123456
    // whosaid:usufdev:2h:-123456
    const parts = data.split(":");

    // chatId is always the last part (could be negative, so last 1-2 parts)
    // Find the chatId by looking for a number at the end
    const chatIdStr = parts[parts.length - 1];
    const chatId = parseInt(chatIdStr, 10);
    if (isNaN(chatId)) return;

    const command = parts[0];

    if (command === "summary") {
      const arg = parts[1]; // time/count arg
      await runSummary(ctx, openai, chatId, arg);
    } else if (command === "topic") {
      // Everything between command and chatId is the query
      const query = parts.slice(1, -1).join(":");
      await runTopic(ctx, openai, chatId, query);
    } else if (command === "whosaid") {
      const username = parts[1];
      const timeArg = parts[2] !== chatIdStr ? parts[2] : undefined;
      await runWhosaid(ctx, openai, chatId, username, timeArg || undefined);
    }
  });

  return composer;
}

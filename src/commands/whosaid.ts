import { Composer, Context } from "grammy";
import OpenAI from "openai";
import { parseTimeArg } from "../helpers/time";
import { fetchMessages, buildTranscript } from "../helpers/messages";
import { askGPT, WHOSAID_PROMPT } from "../helpers/openai";
import { getUserGroups, buildGroupKeyboard, buildFollowUpKeyboard, isDM } from "../helpers/groups";
import { checkUsageLimit, incrementUsage } from "../helpers/premium";

export async function runWhosaid(
  ctx: Context,
  openai: OpenAI,
  targetChatId: number,
  rawUsername: string,
  timeArgStr: string | undefined,
): Promise<void> {
  const timeArg = parseTimeArg(timeArgStr);
  const messages = await fetchMessages(targetChatId, timeArg, { username: rawUsername });

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
    if (isDM(ctx)) {
      await ctx.api.editMessageText(ctx.chat!.id, statusMsg.message_id, result, {
        reply_markup: buildFollowUpKeyboard(targetChatId),
      });
    } else {
      await ctx.api.editMessageText(ctx.chat!.id, statusMsg.message_id, result);
    }
  } catch (err) {
    console.error("OpenAI error:", err);
    await ctx.api.editMessageText(ctx.chat!.id, statusMsg.message_id, "Failed to generate summary. Please try again later.");
  }
}

export function whosaidCommand(openai: OpenAI): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("whosaid", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const userId = ctx.from?.id;
    if (!userId) return;

    const parts = ctx.message?.text?.split(" ");
    const rawUsername = parts?.[1]?.replace(/^@/, "");
    if (!rawUsername) {
      await ctx.reply("Usage: /whosaid <username> [time]\nExamples:\n/whosaid usufdev\n/whosaid jamshid 2h");
      return;
    }

    const timeArgStr = parts?.[2];

    // Premium check
    const allowed = await checkUsageLimit(userId);
    if (allowed !== true) {
      await ctx.reply(allowed);
      return;
    }

    if (ctx.chat.type !== "private") {
      await incrementUsage(userId);
      await runWhosaid(ctx, openai, chatId, rawUsername, timeArgStr);
      return;
    }

    const groups = await getUserGroups(userId);
    if (groups.length === 0) {
      await ctx.reply("I haven't seen you in any groups yet.");
      return;
    }

    if (groups.length === 1) {
      await incrementUsage(userId);
      await runWhosaid(ctx, openai, groups[0].chatId, rawUsername, timeArgStr);
      return;
    }

    const keyboard = buildGroupKeyboard(groups, `whosaid:${rawUsername}:${timeArgStr ?? ""}`);
    await ctx.reply("Which group?", { reply_markup: keyboard });
  });

  return composer;
}

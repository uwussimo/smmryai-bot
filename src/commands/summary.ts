import { Composer, Context } from "grammy";
import OpenAI from "openai";
import { parseTimeArg } from "../helpers/time";
import { fetchMessages, buildTranscript } from "../helpers/messages";
import { askGPT, SUMMARY_PROMPT } from "../helpers/openai";
import { getUserGroups, buildGroupKeyboard } from "../helpers/groups";
import { checkUsageLimit, incrementUsage } from "../helpers/premium";

export async function runSummary(
  ctx: Context,
  openai: OpenAI,
  targetChatId: number,
  arg: string | undefined,
): Promise<void> {
  const timeArg = parseTimeArg(arg);
  const messages = await fetchMessages(targetChatId, timeArg);

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
    await ctx.api.editMessageText(ctx.chat!.id, statusMsg.message_id, summary);
  } catch (err) {
    console.error("OpenAI error:", err);
    await ctx.api.editMessageText(ctx.chat!.id, statusMsg.message_id, "Failed to generate summary. Please try again later.");
  }
}

export function summaryCommand(openai: OpenAI): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("summary", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const userId = ctx.from?.id;
    if (!userId) return;

    // Premium check
    const allowed = await checkUsageLimit(userId);
    if (allowed !== true) {
      await ctx.reply(allowed);
      return;
    }

    const arg = ctx.message?.text?.split(" ")[1];

    // Group chat → run directly
    if (ctx.chat.type !== "private") {
      await incrementUsage(userId);
      await runSummary(ctx, openai, chatId, arg);
      return;
    }

    // DM → resolve which group
    const groups = await getUserGroups(userId);
    if (groups.length === 0) {
      await ctx.reply("I haven't seen you in any groups yet. Send some messages in a group where I'm active.");
      return;
    }

    if (groups.length === 1) {
      await incrementUsage(userId);
      await runSummary(ctx, openai, groups[0].chatId, arg);
      return;
    }

    // Multiple groups → show inline buttons
    const keyboard = buildGroupKeyboard(groups, `summary:${arg ?? "50"}`);
    await ctx.reply("Which group do you want to summarize?", { reply_markup: keyboard });
  });

  return composer;
}

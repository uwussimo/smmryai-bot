import { Composer, Context, InlineKeyboard } from "grammy";
import OpenAI from "openai";
import { runSummary } from "../commands/summary";
import { runTopic } from "../commands/topic";
import { runWhosaid } from "../commands/whosaid";
import { incrementUsage, checkUsageLimit } from "../helpers/premium";
import { getUserGroups } from "../helpers/groups";
import { setUserLanguage, getUserLanguage } from "../helpers/settings";

export function callbackHandler(openai: OpenAI): Composer<Context> {
  const composer = new Composer<Context>();

  composer.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery();

    const parts = data.split(":");
    const command = parts[0];
    const userId = ctx.from?.id;

    // --- Menu navigation (no usage cost) ---
    if (command === "menu") {
      const action = parts[1];

      if (action === "groups") {
        if (!userId) return;
        const groups = await getUserGroups(userId);
        if (groups.length === 0) {
          await editOrReply(ctx, "I haven't seen you in any groups yet.");
          return;
        }
        const keyboard = new InlineKeyboard();
        for (const group of groups) {
          keyboard.text(group.chatTitle, `groupmenu:${group.chatId}`).row();
        }
        await editOrReply(ctx, "Your groups — tap one to see actions:", keyboard);
        return;
      }

      if (action === "help") {
        await editOrReply(
          ctx,
          `Commands:\n/summary 200 — last 200 messages\n/summary 2h — last 2 hours\n/summary today — since midnight\n/topic <keyword> — topic search\n/whosaid <user> — what someone said\n/groups — your groups\n/pro — upgrade to Pro\n\nFree: 5 summaries/day. Pro: unlimited.`,
        );
        return;
      }
      return;
    }

    // --- Language selection ---
    if (command === "lang") {
      if (!userId) return;
      const langCode = parts[1];
      const langNames: Record<string, string> = { en: "English", ru: "Русский", uz: "O'zbek" };
      if (langNames[langCode]) {
        await setUserLanguage(userId, langCode);
        await editOrReply(ctx, `Language set to ${langNames[langCode]}.`);
      }
      return;
    }

    // --- Group action menu (no usage cost) ---
    if (command === "groupmenu") {
      const chatId = parseInt(parts[1], 10);
      if (isNaN(chatId)) return;

      const keyboard = new InlineKeyboard()
        .text("Last 50 msgs", `summary:50:${chatId}`)
        .text("Last 2h", `summary:2h:${chatId}`)
        .row()
        .text("Today", `summary:today:${chatId}`)
        .text("Yesterday", `summary:yesterday:${chatId}`)
        .row()
        .text("Back to groups", `menu:groups`);

      // Find group title
      if (userId) {
        const groups = await getUserGroups(userId);
        const group = groups.find((g) => g.chatId === chatId);
        const title = group?.chatTitle ?? "this group";
        await editOrReply(ctx, `What do you want from ${title}?`, keyboard);
      } else {
        await editOrReply(ctx, "Pick an action:", keyboard);
      }
      return;
    }

    // --- Commands that cost usage ---

    // Premium check for summary/topic/whosaid
    if (userId && ["summary", "topic", "whosaid"].includes(command)) {
      const allowed = await checkUsageLimit(userId);
      if (allowed !== true) {
        await editOrReply(ctx, allowed);
        return;
      }
      await incrementUsage(userId);
    }

    // Delete the previous message before running the command
    try {
      await ctx.deleteMessage();
    } catch {
      // ignore if already deleted
    }

    // Parse callback data: "command:args:chatId"
    const chatIdStr = parts[parts.length - 1];
    const chatId = parseInt(chatIdStr, 10);
    if (isNaN(chatId)) return;

    if (command === "summary") {
      const arg = parts[1]; // time/count arg
      await runSummary(ctx, openai, chatId, arg);
    } else if (command === "topic") {
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

async function editOrReply(
  ctx: Context,
  text: string,
  keyboard?: InlineKeyboard,
): Promise<void> {
  try {
    if (ctx.callbackQuery?.message) {
      await ctx.editMessageText(text, keyboard ? { reply_markup: keyboard } : undefined);
    } else {
      await ctx.reply(text, keyboard ? { reply_markup: keyboard } : undefined);
    }
  } catch {
    await ctx.reply(text, keyboard ? { reply_markup: keyboard } : undefined);
  }
}

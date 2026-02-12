import { Composer, Context, InlineKeyboard } from "grammy";
import { getUserGroups } from "../helpers/groups";

export function startCommand(): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("start", async (ctx) => {
    if (ctx.chat?.type !== "private") {
      await ctx.reply(
        "Hey! I'm silently recording messages. Use /summary to get a catch-up anytime.",
      );
      return;
    }

    const userId = ctx.from?.id;
    if (!userId) return;

    const groups = await getUserGroups(userId);

    if (groups.length === 0) {
      await ctx.reply(
`Hey! I'm smmryai_bot — I summarize group chats so you don't have to read hundreds of messages.

How to use:
1. Add me to a group chat
2. I'll silently record messages in the background
3. Come back here and tap a button to get a private summary

You're not in any groups yet — add me to one and send some messages first!`,
      );
      return;
    }

    const keyboard = new InlineKeyboard();

    // If user is in exactly one group, show quick time-based actions
    if (groups.length === 1) {
      const chatId = groups[0].chatId;
      keyboard
        .text("Last 50 msgs", `summary:50:${chatId}`)
        .text("Last 2h", `summary:2h:${chatId}`)
        .row()
        .text("Today", `summary:today:${chatId}`)
        .text("Yesterday", `summary:yesterday:${chatId}`)
        .row()
        .text("My Groups", `menu:groups`)
        .text("Help", `menu:help`);

      await ctx.reply(
        `Hey! Ready to catch up on ${groups[0].chatTitle}?`,
        { reply_markup: keyboard },
      );
      return;
    }

    // Multiple groups — show group picker
    for (const group of groups) {
      keyboard.text(group.chatTitle, `groupmenu:${group.chatId}`).row();
    }
    keyboard.text("Help", `menu:help`);

    await ctx.reply(
      `Hey! You're in ${groups.length} groups. Pick one to catch up:`,
      { reply_markup: keyboard },
    );
  });

  return composer;
}

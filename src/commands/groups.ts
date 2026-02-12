import { Composer, Context, InlineKeyboard } from "grammy";
import { getUserGroups } from "../helpers/groups";

export function groupsCommand(): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("groups", async (ctx) => {
    if (ctx.chat?.type !== "private") {
      await ctx.reply("Use this command in a DM with me.");
      return;
    }

    const userId = ctx.from?.id;
    if (!userId) return;

    const groups = await getUserGroups(userId);

    if (groups.length === 0) {
      await ctx.reply("I haven't seen you in any groups yet. Send some messages in a group where I'm active.");
      return;
    }

    const keyboard = new InlineKeyboard();
    for (const group of groups) {
      keyboard.text(group.chatTitle, `groupmenu:${group.chatId}`).row();
    }

    await ctx.reply("Your groups — tap one to see actions:", { reply_markup: keyboard });
  });

  return composer;
}

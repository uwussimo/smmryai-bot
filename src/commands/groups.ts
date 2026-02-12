import { Composer, Context } from "grammy";
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

    const list = groups.map((g, i) => `${i + 1}. ${g.chatTitle}`).join("\n");
    await ctx.reply(`Your groups:\n\n${list}`);
  });

  return composer;
}

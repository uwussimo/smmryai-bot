import { Composer, Context } from "grammy";
import { messageRepo } from "../helpers/messages";

export function statsCommand(): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("stats", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const total = await messageRepo().count({ where: { chatId } });
    await ctx.reply(`I have ${total} messages recorded in this chat.`);
  });

  return composer;
}

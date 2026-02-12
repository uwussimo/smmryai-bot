import { Composer, Context } from "grammy";

export function startCommand(): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("start", async (ctx) => {
    await ctx.reply(
`Hey! I'm smmryai_bot — I summarize group chats so you don't have to read hundreds of messages.

How to use:
1. Add me to a group chat
2. I'll silently record messages in the background
3. Use /summary to get a catch-up anytime

You can also DM me here to get private summaries without spamming the group.

Type /help to see all commands.`
    );
  });

  return composer;
}

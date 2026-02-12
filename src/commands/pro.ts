import { Composer, Context } from "grammy";
import { isPremium } from "../helpers/premium";

export function proCommand(): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("pro", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    if (await isPremium(userId)) {
      await ctx.reply("You're already a Pro subscriber! Enjoy unlimited summaries.");
      return;
    }

    await ctx.replyWithInvoice(
      "Pro — Unlimited Summaries",
      "Unlimited summaries, topic searches, and who-said lookups for 30 days.",
      "pro_monthly",
      "XTR",
      [{ label: "Pro (30 days)", amount: 100 }],
    );
  });

  return composer;
}

import { Composer, Context } from "grammy";
import { activateSubscription } from "../helpers/premium";

export function paymentHandler(): Composer<Context> {
  const composer = new Composer<Context>();

  // Approve the checkout — Telegram requires a response within 10 seconds
  composer.on("pre_checkout_query", async (ctx) => {
    await ctx.answerPreCheckoutQuery(true);
  });

  // Payment succeeded — activate subscription
  composer.on("message:successful_payment", async (ctx) => {
    const userId = ctx.from?.id;
    const payment = ctx.message?.successful_payment;
    if (!userId || !payment) return;

    const paymentId = payment.telegram_payment_charge_id;
    await activateSubscription(userId, paymentId);

    await ctx.reply(
      "You're now a Pro subscriber! Enjoy unlimited summaries for 30 days.",
    );
  });

  return composer;
}

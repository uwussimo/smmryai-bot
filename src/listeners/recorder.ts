import { Composer, Context } from "grammy";
import { saveMessage } from "../helpers/messages";

export function messageRecorder(): Composer<Context> {
  const composer = new Composer<Context>();

  composer.on("message:text", async (ctx, next) => {
    if (!ctx.message.text.startsWith("/")) {
      await saveMessage(ctx.message, ctx.message.text);
    }
    await next();
  });

  composer.on("message:sticker", async (ctx, next) => {
    const sticker = ctx.message.sticker;
    const emoji = sticker.emoji ?? "sticker";
    await saveMessage(ctx.message, `[${emoji} sticker]`);
    await next();
  });

  return composer;
}

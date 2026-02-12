import { Bot } from "grammy";
import OpenAI from "openai";
import { messageRecorder } from "./listeners/recorder";
import { callbackHandler } from "./listeners/callbacks";
import { paymentHandler } from "./listeners/payments";
import { summaryCommand } from "./commands/summary";
import { topicCommand } from "./commands/topic";
import { whosaidCommand } from "./commands/whosaid";
import { helpCommand } from "./commands/help";
import { statsCommand } from "./commands/stats";
import { groupsCommand } from "./commands/groups";
import { startCommand } from "./commands/start";
import { proCommand } from "./commands/pro";
import { langCommand } from "./commands/lang";
import { touchActivity } from "./helpers/analytics";

export function createBot(token: string, openaiKey: string): Bot {
  const bot = new Bot(token);
  const openai = new OpenAI({ apiKey: openaiKey });

  // Debug logging + activity tracking
  bot.use(async (ctx, next) => {
    console.log(
      `[UPDATE] chat=${ctx.chat?.id}, from=${ctx.from?.username ?? ctx.from?.id}, text=${ctx.message?.text ?? "(no text)"}`,
    );
    if (ctx.from?.id) touchActivity(ctx.from.id).catch(() => {});
    await next();
  });

  // Payment handlers (must be before other middleware)
  bot.use(paymentHandler());

  // Message recording (must be before commands)
  bot.use(messageRecorder());

  // Inline button callbacks
  bot.use(callbackHandler(openai));

  // Commands
  bot.use(summaryCommand(openai));
  bot.use(topicCommand(openai));
  bot.use(whosaidCommand(openai));
  bot.use(groupsCommand());
  bot.use(startCommand());
  bot.use(helpCommand());
  bot.use(statsCommand());
  bot.use(proCommand());
  bot.use(langCommand());

  return bot;
}

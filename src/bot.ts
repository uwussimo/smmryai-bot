import { Bot } from "grammy";
import OpenAI from "openai";
import { messageRecorder } from "./listeners/recorder";
import { summaryCommand } from "./commands/summary";
import { topicCommand } from "./commands/topic";
import { whosaidCommand } from "./commands/whosaid";
import { helpCommand } from "./commands/help";
import { statsCommand } from "./commands/stats";

export function createBot(token: string, openaiKey: string): Bot {
  const bot = new Bot(token);
  const openai = new OpenAI({ apiKey: openaiKey });

  // Debug logging
  bot.use(async (ctx, next) => {
    console.log(
      `[UPDATE] chat=${ctx.chat?.id}, from=${ctx.from?.username ?? ctx.from?.id}, text=${ctx.message?.text ?? "(no text)"}`,
    );
    await next();
  });

  // Message recording (must be before commands)
  bot.use(messageRecorder());

  // Commands
  bot.use(summaryCommand(openai));
  bot.use(topicCommand(openai));
  bot.use(whosaidCommand(openai));
  bot.use(helpCommand());
  bot.use(statsCommand());

  return bot;
}

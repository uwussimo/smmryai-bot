import { Bot, Context } from "grammy";
import { AppDataSource } from "./database";
import { Message } from "./entity/Message";
import OpenAI from "openai";

const messageRepo = () => AppDataSource.getRepository(Message);

export function createBot(token: string, openaiKey: string): Bot {
  const bot = new Bot(token);
  const openai = new OpenAI({ apiKey: openaiKey });

  // ── Debug: log every update the bot receives ────────────────────
  bot.use(async (ctx, next) => {
    console.log(
      `[UPDATE] chat=${ctx.chat?.id}, from=${ctx.from?.username ?? ctx.from?.id}, text=${ctx.message?.text ?? "(no text)"}`,
    );
    await next();
  });

  // ── Helper to save a message entry ─────────────────────────────
  async function saveMessage(
    msg: {
      chat: { id: number };
      message_id: number;
      from: {
        id: number;
        username?: string;
        first_name: string;
        last_name?: string;
      };
      date: number;
    },
    text: string,
  ) {
    try {
      const entry = new Message();
      entry.chatId = msg.chat.id;
      entry.messageId = msg.message_id;
      entry.userId = msg.from.id;
      entry.username =
        msg.from.username ??
        [msg.from.first_name, msg.from.last_name].filter(Boolean).join(" ");
      entry.text = text;
      entry.date = new Date(msg.date * 1000);

      await messageRepo().save(entry);
      console.log(
        `Saved message from ${entry.username} in chat ${entry.chatId}`,
      );
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  }

  // ── Log text messages ──────────────────────────────────────────
  bot.on("message:text", async (ctx, next) => {
    if (!ctx.message.text.startsWith("/")) {
      await saveMessage(ctx.message, ctx.message.text);
    }
    await next();
  });

  // ── Log stickers ──────────────────────────────────────────────
  bot.on("message:sticker", async (ctx, next) => {
    const sticker = ctx.message.sticker;
    const emoji = sticker.emoji ?? "sticker";
    await saveMessage(ctx.message, `[${emoji} sticker]`);
    await next();
  });

  // ── /summary <count> ─────────────────────────────────────────────
  bot.command("summary", async (ctx: Context) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const args = ctx.message?.text?.split(" ");
    const count = Math.min(
      Math.max(parseInt(args?.[1] ?? "50", 10) || 50, 1),
      1000,
    );

    const messages = await messageRepo().find({
      where: { chatId },
      order: { date: "DESC" },
      take: count,
    });

    if (messages.length === 0) {
      await ctx.reply(
        "No messages recorded yet. I need to observe some chat first!",
      );
      return;
    }

    // Build the conversation transcript (oldest first)
    const transcript = messages
      .reverse()
      .map((m) => `[${m.username}]: ${m.text}`)
      .join("\n");

    const statusMsg = await ctx.reply(
      `Summarizing ${messages.length} messages...`,
    );

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a strict filter. You read group chat transcripts and extract ONLY high-priority information. Everything else is discarded.

SKIP ALL OF THIS — do not mention it at all:
Jokes, memes, roasting, insults, trolling, sarcasm, banter, greetings, goodbyes, reactions, stickers, "lol", spam, repeated messages, off-topic chatter, small talk, arguments that go nowhere.

ONLY EXTRACT — ranked by priority:
1. URGENT: Deadlines, emergencies, time-sensitive requests
2. DECISIONS: Anything the group agreed on or decided
3. PLANS: Meetups, events, schedules, coordination
4. TASKS: Action items, things someone promised to do
5. INFO: Links, resources, facts, recommendations, news shared
6. QUESTIONS: Unanswered questions that still need a response

Output format:
- One line TL;DR at the top
- Bullet points grouped by priority (highest first), with who said what
- If nothing above was found, respond ONLY with: "Nothing worth catching up on."
- Same language as the chat. Plain text only. As short as possible.`,
          },
          {
            role: "user",
            content: `Summarize the following ${messages.length} messages from a group chat:\n\n${transcript}`,
          },
        ],
        max_tokens: 1500,
      });

      const summary =
        completion.choices[0]?.message?.content ??
        "Could not generate summary.";

      await ctx.api.editMessageText(chatId, statusMsg.message_id, summary);
    } catch (err) {
      console.error("OpenAI error:", err);
      await ctx.api.editMessageText(
        chatId,
        statusMsg.message_id,
        "Failed to generate summary. Please try again later.",
      );
    }
  });

  // ── /stats ───────────────────────────────────────────────────────
  bot.command("stats", async (ctx: Context) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const total = await messageRepo().count({ where: { chatId } });

    await ctx.reply(`I have ${total} messages recorded in this chat.`);
  });

  return bot;
}

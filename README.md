# smmryai_bot

A Telegram bot that silently listens to group chat messages and generates AI-powered summaries on demand. Skip the noise, catch up on what matters.

## How it works

1. Add the bot to a group chat
2. It quietly records all messages in the background
3. When you need to catch up, run `/summary 200` to get a summary of the last 200 messages
4. DM the bot for private summaries — no group spam
5. Pick your language and the bot always replies in it

## Commands

| Command | Description |
|---|---|
| `/start` | Welcome message with quick action buttons |
| `/summary 200` | Summarize the last 200 messages |
| `/summary 2h` | Summarize the last 2 hours |
| `/summary 30m` | Summarize the last 30 minutes |
| `/summary today` | Summarize everything since midnight |
| `/summary yesterday` | Summarize yesterday's messages |
| `/topic <keyword>` | Search what was said about a specific topic |
| `/whosaid <user>` | Summarize what a specific person said |
| `/whosaid <user> 2h` | What did someone say in the last 2 hours |
| `/groups` | List your groups with action buttons (DM only) |
| `/lang` | Set summary language (English, Russian, Uzbek) |
| `/pro` | Upgrade to Pro for unlimited summaries |
| `/stats` | Show how many messages have been recorded |
| `/help` | Show all available commands |

All commands work in both group chats and DMs. In DMs, the bot will ask you to pick a group if you're in more than one.

## Features

- **Localization** — summaries in English, Russian, or Uzbek via `/lang`
- **Private summaries** — DM the bot to get summaries without spamming the group
- **Interactive DM** — inline buttons for quick actions, group selection, and follow-ups
- **Priority ranking** — urgent items, decisions, and plans float to the top
- **Topic search** — find what was said about a specific subject
- **Per-user summaries** — see what a specific person has been saying
- **Premium with Telegram Stars** — 5 free summaries/day, unlimited for 100 Stars/month
- **Admin analytics** — MAU tracking visible to admins via `/stats`

## Tech stack

- **[Grammy](https://grammy.dev/)** — Telegram Bot framework for TypeScript
- **[TypeORM](https://typeorm.io/)** + **SQLite** — message storage
- **[OpenAI API](https://platform.openai.com/)** — GPT-4o for summarization
- **Telegram Stars** — in-app payments for premium subscriptions

## Setup

### Prerequisites

- Node.js 18+
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- An OpenAI API key

### 1. Clone and install

```bash
git clone https://github.com/usufdev/summary-ai-bot.git
cd summary-ai-bot
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
BOT_TOKEN=your_telegram_bot_token
OPENAI_API_KEY=your_openai_api_key
ADMIN_IDS=your_telegram_user_id
```

`ADMIN_IDS` is a comma-separated list of Telegram user IDs that can see admin stats (MAU).

### 3. Disable Group Privacy (important!)

The bot needs to see all messages, not just commands:

1. Message **@BotFather** on Telegram
2. `/mybots` → select your bot → **Bot Settings** → **Group Privacy** → **Turn off**
3. **Remove and re-add** the bot to any existing groups (the setting only applies to groups joined after the change)

### 4. Enable Payments (for premium)

To accept Telegram Stars:

1. Message **@BotFather** → `/mybots` → select your bot → **Payments**
2. No external provider needed — Telegram Stars work natively

### 5. Run

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Deploy on Railway

1. Push to GitHub
2. Create a new project on [railway.app](https://railway.app) → **Deploy from GitHub Repo**
3. Add environment variables: `BOT_TOKEN`, `OPENAI_API_KEY`, `DB_PATH=/data/bot.db`, `ADMIN_IDS`
4. Add a **Volume** mounted at `/data` to persist the database across deploys

## License

ISC

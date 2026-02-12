# smmryai_bot

A Telegram bot that silently listens to group chat messages and generates AI-powered summaries on demand. Skip the noise, catch up on what matters.

## How it works

1. Add the bot to a group chat
2. It quietly records all messages in the background
3. When you need to catch up, run `/summary 200` to get a summary of the last 200 messages
4. The bot filters out spam, jokes, and banter — only reporting decisions, plans, tasks, and important info, ranked by priority

## Commands

| Command | Description |
|---|---|
| `/summary <count>` | Summarize the last `<count>` messages (default: 50, max: 1000) |
| `/stats` | Show how many messages have been recorded in the current chat |

## Tech stack

- **[Grammy](https://grammy.dev/)** — Telegram Bot framework for TypeScript
- **[TypeORM](https://typeorm.io/)** + **SQLite** — message storage
- **[OpenAI API](https://platform.openai.com/)** — GPT-4o-mini for summarization

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
```

### 3. Disable Group Privacy (important!)

The bot needs to see all messages, not just commands:

1. Message **@BotFather** on Telegram
2. `/mybots` → select your bot → **Bot Settings** → **Group Privacy** → **Turn off**
3. **Remove and re-add** the bot to any existing groups (the setting only applies to groups joined after the change)

### 4. Run

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
3. Add environment variables: `BOT_TOKEN`, `OPENAI_API_KEY`, `DB_PATH=/data/bot.db`
4. Add a **Volume** mounted at `/data` to persist the database across deploys

## License

ISC

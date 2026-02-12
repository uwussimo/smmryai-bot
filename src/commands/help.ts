import { Composer, Context } from "grammy";

export function helpCommand(): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("help", async (ctx) => {
    await ctx.reply(
`smmryai_bot — I silently record messages and summarize on demand.

Commands (work in groups and DMs):
/summary 200 — last 200 messages
/summary 2h — last 2 hours
/summary 30m — last 30 minutes
/summary today — since midnight
/summary yesterday — yesterday's messages
/topic <keyword> — what was said about a topic
/whosaid <user> — what someone said
/whosaid <user> 2h — what someone said in last 2h
/stats — how many messages I've recorded
/groups — list your groups (DM only)
/pro — upgrade to Pro (unlimited summaries)
/help — this message

Free: 5 summaries per day. Pro: unlimited for 100 Stars/month.
DM me to get private summaries without spamming the group.`
    );
  });

  return composer;
}

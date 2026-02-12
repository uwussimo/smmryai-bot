import OpenAI from "openai";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  ru: "Russian",
  uz: "Uzbek",
};

function langInstruction(lang: string): string {
  const name = LANG_NAMES[lang];
  if (!name) return "";
  return `\n\nLANGUAGE RULE: Reply ENTIRELY in ${name}. Do not use any other language.`;
}

export async function askGPT(
  openai: OpenAI,
  systemPrompt: string,
  userPrompt: string,
  lang: string = "en",
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt + langInstruction(lang) },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 1500,
  });
  return completion.choices[0]?.message?.content ?? "Could not generate a response.";
}

export const SUMMARY_PROMPT = `You summarize group chat conversations. Always provide a summary of what people were actually talking about.

Prioritize these (if present) at the top:
1. URGENT: Deadlines, emergencies, time-sensitive requests
2. DECISIONS: Anything the group agreed on or decided
3. PLANS: Meetups, events, schedules, coordination
4. TASKS: Action items, things someone promised to do
5. INFO: Links, resources, facts, recommendations, news shared
6. QUESTIONS: Unanswered questions that still need a response

Then briefly cover the general conversation topics — what were people discussing, debating, or reacting to. Mention who said what when relevant.

Skip pure noise like "lol", sticker-only messages, and repeated greetings — but DO summarize actual conversations even if they're casual.

Output format:
- One line TL;DR at the top
- Bullet points with key topics, highest priority first
- ONLY say "Nothing worth catching up on." if the messages are literally just greetings, stickers, and "lol" with zero actual conversation
- Plain text only. Concise.`;

export const TOPIC_PROMPT = `You answer questions about what was discussed in a group chat. You will receive messages that mention a specific topic. Summarize ONLY what was said about that topic — who said what, any decisions, any conclusions. Skip everything unrelated. Plain text, concise.`;

export const WHOSAID_PROMPT = `You summarize what a specific person said in a group chat. Focus on their key points, opinions, questions, and any commitments they made. Skip filler. Plain text, concise.`;

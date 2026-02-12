import { MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../database";
import { Message } from "../entity/Message";
import { TimeArg } from "./time";

export const messageRepo = () => AppDataSource.getRepository(Message);

export async function fetchMessages(
	chatId: number,
	timeArg: TimeArg,
	extraWhere?: Record<string, unknown>,
): Promise<Message[]> {
	const where: Record<string, unknown> = { chatId, ...extraWhere };

	if (timeArg.type === "since") {
		where.date = MoreThanOrEqual(timeArg.value);
		return messageRepo().find({ where, order: { date: "ASC" } });
	}

	const messages = await messageRepo().find({
		where,
		order: { date: "DESC" },
		take: timeArg.value,
	});
	return messages.reverse();
}

export function buildTranscript(messages: Message[]): string {
	return messages.map((m) => `[${m.username}]: ${m.text}`).join("\n");
}

export async function saveMessage(
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
): Promise<void> {
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
		console.log(`Saved message from ${entry.username} in chat ${entry.chatId}`);
	} catch (err) {
		console.error("Failed to save message:", err);
	}
}

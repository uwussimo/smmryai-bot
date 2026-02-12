import { AppDataSource } from "../database";
import { UserGroup } from "../entity/UserGroup";
import { InlineKeyboard, Context } from "grammy";

const userGroupRepo = () => AppDataSource.getRepository(UserGroup);

export async function trackUserGroup(
	userId: number,
	chatId: number,
	username: string,
	chatTitle: string,
): Promise<void> {
	try {
		await userGroupRepo().upsert(
			{ userId, chatId, username, chatTitle, lastSeen: new Date() },
			["userId", "chatId"],
		);
	} catch (err) {
		console.error("Failed to track user-group:", err);
	}
}

export async function getUserGroups(userId: number): Promise<UserGroup[]> {
	return userGroupRepo().find({
		where: { userId },
		order: { lastSeen: "DESC" },
	});
}

export function buildGroupKeyboard(
	groups: UserGroup[],
	callbackPrefix: string,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();
	for (const group of groups) {
		keyboard.text(group.chatTitle, `${callbackPrefix}:${group.chatId}`).row();
	}
	return keyboard;
}

export function buildFollowUpKeyboard(chatId: number): InlineKeyboard {
	return new InlineKeyboard()
		.text("Last 2h", `summary:2h:${chatId}`)
		.text("Today", `summary:today:${chatId}`)
		.text("Yesterday", `summary:yesterday:${chatId}`)
		.row()
		.text("Back to groups", `menu:groups`);
}

export function isDM(ctx: Context): boolean {
	return ctx.chat?.type === "private";
}

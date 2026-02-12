import { AppDataSource } from "../database";
import { UserSettings } from "../entity/UserSettings";

const repo = () => AppDataSource.getRepository(UserSettings);

export async function getUserLanguage(userId: number): Promise<string> {
	const row = await repo().findOneBy({ userId });
	return row?.language ?? "en";
}

export async function setUserLanguage(
	userId: number,
	language: string,
): Promise<void> {
	const existing = await repo().findOneBy({ userId });
	if (existing) {
		existing.language = language;
		await repo().save(existing);
	} else {
		await repo().save(
			repo().create({ userId, language, lastActive: new Date() }),
		);
	}
}

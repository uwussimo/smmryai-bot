import { MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../database";
import { UserSettings } from "../entity/UserSettings";

const repo = () => AppDataSource.getRepository(UserSettings);

export async function touchActivity(userId: number): Promise<void> {
	const existing = await repo().findOneBy({ userId });
	if (existing) {
		existing.lastActive = new Date();
		await repo().save(existing);
	} else {
		await repo().save(
			repo().create({ userId, language: "en", lastActive: new Date() }),
		);
	}
}

export async function getMAU(): Promise<number> {
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	return repo().count({
		where: { lastActive: MoreThanOrEqual(thirtyDaysAgo) },
	});
}

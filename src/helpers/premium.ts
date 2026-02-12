import { AppDataSource } from "../database";
import { DailyUsage } from "../entity/DailyUsage";
import { Subscription } from "../entity/Subscription";

const FREE_DAILY_LIMIT = 5;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function isPremium(userId: number): Promise<boolean> {
  const repo = AppDataSource.getRepository(Subscription);
  const sub = await repo.findOneBy({ userId });
  return !!sub && new Date(sub.expiresAt) > new Date();
}

export async function getDailyUsage(userId: number): Promise<number> {
  const repo = AppDataSource.getRepository(DailyUsage);
  const row = await repo.findOneBy({ userId, date: todayStr() });
  return row?.count ?? 0;
}

export async function incrementUsage(userId: number): Promise<void> {
  const repo = AppDataSource.getRepository(DailyUsage);
  const date = todayStr();
  const existing = await repo.findOneBy({ userId, date });
  if (existing) {
    existing.count += 1;
    await repo.save(existing);
  } else {
    await repo.save(repo.create({ userId, date, count: 1 }));
  }
}

/**
 * Returns true if the user can use a summary command.
 * If not, returns a string with the denial message.
 */
export async function checkUsageLimit(
  userId: number,
): Promise<true | string> {
  if (await isPremium(userId)) return true;

  const used = await getDailyUsage(userId);
  if (used < FREE_DAILY_LIMIT) return true;

  return `You've used all ${FREE_DAILY_LIMIT} free summaries for today.\n\nUpgrade to Pro for unlimited summaries — just 100 Stars/month.\nUse /pro to subscribe.`;
}

export async function activateSubscription(
  userId: number,
  paymentId: string,
): Promise<void> {
  const repo = AppDataSource.getRepository(Subscription);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const existing = await repo.findOneBy({ userId });
  if (existing) {
    existing.expiresAt = expiresAt;
    existing.telegramPaymentId = paymentId;
    await repo.save(existing);
  } else {
    await repo.save(
      repo.create({ userId, expiresAt, telegramPaymentId: paymentId }),
    );
  }
}

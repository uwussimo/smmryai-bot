import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: "integer" })
  userId: number;

  @Column({ type: "datetime" })
  expiresAt: Date;

  @Column({ type: "text" })
  telegramPaymentId: string;
}

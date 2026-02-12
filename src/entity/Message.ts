import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity()
export class Message {
	@PrimaryGeneratedColumn()
	id: number;

	/** Telegram chat ID (group) */
	@Index()
	@Column({ type: "integer" })
	chatId: number;

	/** Telegram message ID */
	@Column({ type: "integer" })
	messageId: number;

	/** Sender's Telegram user ID */
	@Column({ type: "integer" })
	userId: number;

	/** Sender display name */
	@Column({ type: "text" })
	username: string;

	/** Message text content */
	@Column({ type: "text" })
	text: string;

	/** When the message was sent */
	@Index()
	@Column({ type: "datetime" })
	date: Date;
}

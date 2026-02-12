import { Entity, PrimaryGeneratedColumn, Column, Index, Unique } from "typeorm";

@Entity()
@Unique(["userId", "chatId"])
export class UserGroup {
	@PrimaryGeneratedColumn()
	id: number;

	@Index()
	@Column({ type: "integer" })
	userId: number;

	@Index()
	@Column({ type: "integer" })
	chatId: number;

	@Column({ type: "text" })
	username: string;

	@Column({ type: "text" })
	chatTitle: string;

	@Column({ type: "datetime" })
	lastSeen: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity()
export class UserSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: "integer" })
  userId: number;

  /** "en" | "ru" | "uz" */
  @Column({ type: "text", default: "en" })
  language: string;

  @Column({ type: "datetime" })
  lastActive: Date;
}

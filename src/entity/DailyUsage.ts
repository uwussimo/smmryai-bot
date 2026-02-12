import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity()
@Unique(["userId", "date"])
export class DailyUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "integer" })
  userId: number;

  /** Date string YYYY-MM-DD */
  @Column({ type: "text" })
  date: string;

  @Column({ type: "integer", default: 0 })
  count: number;
}

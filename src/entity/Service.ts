import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Incident } from "./Incident";
import { ServiceStatusHistory } from "./ServiceStatusHistory";
import { ServiceStatus } from "../types/service";

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({
    type: "enum",
    enum: ServiceStatus,
  })
  status!: ServiceStatus;

  @Column({ type: "text", nullable: true })
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Incident, (incident) => incident.service)
  incidents!: Incident[];

  @OneToMany(() => ServiceStatusHistory, (history) => history.service)
  history!: ServiceStatusHistory[];

  @Column({ nullable: true })
  deletedAt?: Date;
}

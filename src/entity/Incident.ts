import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Service } from "./Service";
import { IncidentStatus, IncidentSeverity } from "../types/incidents";
import { IncidentUpdate } from "./IncidentUpdate";
import { Admin } from "./Admin";

@Entity()
export class Incident {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service!: Service;

  @Column({ type: "text" })
  description!: string;

  @Column({ default: IncidentStatus.investigating })
  status!: IncidentStatus;

  @Column({
    type: "enum",
    enum: IncidentSeverity,
    default: IncidentSeverity.minor
  })
  severity!: IncidentSeverity;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => IncidentUpdate, update => update.incident)
  updates!: IncidentUpdate[];

  @Column({ nullable: true })
  deletedAt?: Date;
}

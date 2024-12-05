import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Service } from "./Service";
import { ServiceStatus } from "../types/service";
import { Admin } from "./Admin";

@Entity()
export class ServiceStatusHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Service, (service) => service.history)
  service!: Service;

  @Column({ type: "enum", enum: ServiceStatus })
  status!: ServiceStatus;

  @CreateDateColumn()
  timestamp!: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}

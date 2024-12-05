import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Incident } from "./Incident";

@Entity()
export class IncidentUpdate {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Incident, (incident) => incident.updates)
  incident!: Incident;

  @Column()
  comment!: string;

  @Column()
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
} 

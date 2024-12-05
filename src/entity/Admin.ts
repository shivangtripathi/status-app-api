import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Incident } from "./Incident";
import { ServiceStatusHistory } from "./ServiceStatusHistory";

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;
}

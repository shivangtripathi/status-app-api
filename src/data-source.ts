import "reflect-metadata";
import { DataSource } from "typeorm";
import { Service } from "./entity/Service";
import { Admin } from "./entity/Admin";
import dotenv from "dotenv";
import { ServiceStatusHistory } from "./entity/ServiceStatusHistory";
import { Incident } from "./entity/Incident";
import { IncidentUpdate } from "./entity/IncidentUpdate";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // Auto-create tables (disable in production)
  logging: false,
  entities: [Service, Admin, Incident, ServiceStatusHistory, IncidentUpdate],
  migrations: [],
});

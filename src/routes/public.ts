import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Service } from "../entity/Service";
import { ServiceStatusHistory } from "../entity/ServiceStatusHistory";
import { Incident } from "../entity/Incident";
import { IncidentStatus } from "../types/incidents";
import { IsNull, Not } from "typeorm";
const router = express.Router();

// Get all services and their statuses
router.get("/services", async (req: Request, res: Response) => {
  try {
    const serviceRepository = AppDataSource.getRepository(Service);
    const servicesWithHistory = await serviceRepository
      .createQueryBuilder("service")
      .leftJoinAndSelect(
        "service.history",
        "history"
      )
      .where("service.deletedAt IS NULL")
      .orderBy("service.updatedAt", "DESC")
      .addOrderBy("history.timestamp", "DESC")
      .getMany();
    res.status(200).json({ data: servicesWithHistory });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services." });
  }
});

router.get("/services/status", async (req: Request, res: Response) => {
  try {
    const serviceRepository = AppDataSource.getRepository(Service);

    const services = await serviceRepository.find({
      relations: ["incidents"]
    });

    const result = services.map((service) => ({
      id: service.id,
      name: service.name,
      status: service.status,
      description: service.description,
      activeIncidents: service.incidents.filter(
        (incident) => incident.status !== IncidentStatus.resolved
      ),
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch services status" });
  }
});

router.get("/incidents", async (req: Request, res: Response) => {
  try {
    const incidentRepository = AppDataSource.getRepository(Incident);
    const incidents = await incidentRepository
      .createQueryBuilder("incident")
      .leftJoinAndSelect("incident.service", "service")
      .leftJoinAndSelect("incident.updates", "updates")
      .where("incident.deletedAt IS NULL")
      .orderBy("incident.createdAt", "DESC")
      .addOrderBy("updates.createdAt", "DESC")
      .getMany();

    res.json({ data: incidents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

router.get("/services/timeline", async (req: Request, res: Response) => {
  try {
    const historyRepository = AppDataSource.getRepository(ServiceStatusHistory);

    const history = await historyRepository.find({
      where: { deletedAt: Not(IsNull()) },
      relations: ["service"],
      order: { timestamp: "DESC" },
      take: 50
    });

    const result = history.map((entry) => ({
      serviceName: entry.service.name,
      status: entry.status,
      timestamp: entry.timestamp,
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch timeline" });
  }
});

export default router;

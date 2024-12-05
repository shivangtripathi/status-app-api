import express, { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source";
import { Admin } from "../entity/Admin";
import { Service } from "../entity/Service";
import { ServiceStatus } from "../types/service";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { adminRegisterSchema, adminLoginSchema } from "../schemas/admin.schema";
import { createServiceSchema, updateServiceSchema } from "../schemas/service.schema";
import { validate } from "../middleware/validate";
import { authenticateJWT } from "../middleware/auth";
import { Incident } from "../entity/Incident";
import { getIO } from '../socket';
import { IncidentUpdate } from "../entity/IncidentUpdate";
import { IncidentStatus, IncidentSeverity } from "../types/incidents";
import { ServiceStatusHistory } from "../entity/ServiceStatusHistory";

const router: Router = express.Router();

// Admin registration (for testing; disable in production)
router.post(
  "/register",
  validate(adminRegisterSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const adminRepository = AppDataSource.getRepository(Admin);

      const existingAdmin = await adminRepository.findOneBy({ email });
      if (existingAdmin) {
        res.status(400).json({ error: "Email already registered." });
        return;
      }

      const hashedPassword = await hashPassword(password);
      const admin = adminRepository.create({ email, password: hashedPassword });
      await adminRepository.save(admin);

      res.status(201).json({ message: "Admin registered successfully." });
    } catch (error) {
      res.status(500).json({ error: "Failed to register admin." });
    }
  }
);

// Admin login
router.post(
  "/login",
  validate(adminLoginSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const adminRepository = AppDataSource.getRepository(Admin);

      const admin = await adminRepository.findOneBy({ email });
      if (!admin) {
        res.status(401).json({ error: "Invalid email or password." });
        return;
      }

      const isPasswordValid = await comparePassword(password, admin.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid email or password." });
        return;
      }

      const token = generateToken({ id: admin.id, email: admin.email });
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ error: `Failed to login. ${error}` });
    }
  }
);

// Create a service (protected route)
router.post(
  "/services",
  authenticateJWT,
  validate(createServiceSchema),
  async (req: Request, res: Response) => {
    try {
      const { name, status, description } = req.body;
      const serviceRepository = AppDataSource.getRepository(Service);

      const service = serviceRepository.create({
        name,
        status: status,
        description
      });

      const savedService = await serviceRepository.save(service);
      res.status(201).json(savedService);
      return;
    } catch (error) {
      res.status(500).json({ error: "Failed to create service." });
      return;
    }
  }
);

//Delete a service (protected route)
router.delete("/services/:id", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id);
    const serviceRepository = AppDataSource.getRepository(Service);
    const service = await serviceRepository.findOneBy({ id: serviceId });
    if (!service) {
      res.status(404).json({ error: "Service not found." });
      return;
    }
    service.deletedAt = new Date();
    await serviceRepository.save(service);
    //delete all related incidents
    const incidentRepository = AppDataSource.getRepository(Incident);
    const incidents = await incidentRepository.find({
      where: { service: { id: serviceId } }
    });
    for (const incident of incidents) {
      incident.deletedAt = new Date();
      await incidentRepository.save(incident);
    }
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: `Failed to delete service. ${error}` });
  }
});

// Update a service (protected route)
router.put(
  "/services/:id",
  authenticateJWT,
  validate(updateServiceSchema),
  async (req: Request, res: Response) => {
    try {
      const { status, description } = req.body;
      const serviceId = parseInt(req.params.id);
      const serviceRepository = AppDataSource.getRepository(Service);

      const service = await serviceRepository.findOneBy({ id: serviceId });
      if (!service) {
        res.status(404).json({ error: "Service not found." });
        return;
      }

      service.status = status;
      service.description = description;

      const updatedService = await serviceRepository.save(service);

      // Emit socket event for service update
      getIO().emit('serviceUpdate', {
        id: updatedService.id,
        status: updatedService.status,
        description: updatedService.description
      });

      res.status(200).json(updatedService);
    } catch (error) {
      res.status(500).json({ error: "Failed to update service." });
    }
  }
);

//create incident
router.post("/incidents", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { serviceId, description, title, status, severity } = req.body;
    const incidentRepository = AppDataSource.getRepository(Incident);

    const serviceRepository = AppDataSource.getRepository(Service);
    const service = await serviceRepository.findOneBy({ id: serviceId });
    if (!service) {
      res.status(404).json({ error: "Service not found." });
      return;
    }

    const incident = incidentRepository.create({
      service,
      description,
      title,
      status: status || IncidentStatus.investigating,
      severity: severity || IncidentSeverity.minor
    });

    const savedIncident = await incidentRepository.save(incident);
    res.status(201).json(savedIncident);
  } catch (error) {
    res.status(500).json({ error: "Failed to create incident." });
  }
});

// Add incident update
router.post("/incidents/:id/updates", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { comment, status, severity } = req.body;
    const incidentId = parseInt(req.params.id);
    const incidentRepository = AppDataSource.getRepository(Incident);
    const incidentUpdateRepository = AppDataSource.getRepository(IncidentUpdate);

    const incident = await incidentRepository.findOneBy({ id: incidentId });
    if (!incident) {
      res.status(404).json({ error: "Incident not found." });
      return;
    }

    // Create incident update
    const update = incidentUpdateRepository.create({
      incident,
      comment,
      status
    });
    await incidentUpdateRepository.save(update);

    // Update incident status and severity
    incident.status = status;
    if (severity) {
      incident.severity = severity;
    }
    await incidentRepository.save(incident);

    // Emit socket event for incident update
    getIO().emit('incidentUpdate', {
      id: incident.id,
      status: incident.status,
      severity: incident.severity,
      title: incident.title,
    });

    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ error: `Failed to add incident update. ${error}` });
  }
});

router.delete("/incidents/:id", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const incidentId = parseInt(req.params.id);
    const incidentRepository = AppDataSource.getRepository(Incident);

    const incident = await incidentRepository.findOne({
      where: {
        id: incidentId
      }
    });

    if (!incident) {
      res.status(404).json({ error: "Incident not found" });
      return;
    }

    incident.deletedAt = new Date();
    await incidentRepository.save(incident);

    res.json({ message: "Incident deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: `Internal server error ${error}` });
  }
});

export default router;

import { z } from "zod";
import { ServiceStatus } from "../types/service";

export const createServiceSchema = z.object({
  name: z.string().min(1, { message: "Service name is required." }),
  status: z.enum([ServiceStatus.Operational, ServiceStatus.DegradedPerformance, ServiceStatus.PartialOutage, ServiceStatus.MajorOutage], {
    errorMap: () => ({ message: "Invalid status. Must be one of: Operational, Degraded Performance, Partial Outage, Major Outage." }),
  }),
  description: z.string().optional(),
});

export const updateServiceSchema = z.object({
  status: z.enum([ServiceStatus.Operational, ServiceStatus.DegradedPerformance, ServiceStatus.PartialOutage, ServiceStatus.MajorOutage], {
    errorMap: () => ({ message: "Invalid status. Must be one of: Operational, Degraded Performance, Partial Outage, Major Outage." }),
  }),
  description: z.string().optional(),
});

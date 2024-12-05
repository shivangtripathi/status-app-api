import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate =
  (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction): void => {
      try {
        // Validate the request body, query, or params against the schema
        schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({ errors: error.errors });
          return;
        }
        next(error);
      }
    };

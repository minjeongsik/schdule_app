import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { requestContext } from "./middlewares/request-context.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { AppointmentsService } from "./modules/appointments/appointments.service.js";
import { AppointmentsController } from "./modules/appointments/appointments.controller.js";
import { createAppointmentsRouter } from "./modules/appointments/appointments.routes.js";
import { PlacesService } from "./modules/places/places.service.js";
import { PlacesController } from "./modules/places/places.controller.js";
import { createPlacesRouter } from "./modules/places/places.routes.js";

export interface AppDependencies {
  db?: unknown;
}

export function createApp(_dependencies: AppDependencies = {}) {
  const app = express();
  const appointmentsService = new AppointmentsService();
  const appointmentsController = new AppointmentsController(appointmentsService);
  const placesService = new PlacesService();
  const placesController = new PlacesController(placesService);

  app.use(cors());
  app.use(express.json());
  app.use(requestContext);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", databaseUrl: env.databaseUrl });
  });

  app.use("/api/appointments", createAppointmentsRouter(appointmentsController));
  app.use("/api/places", createPlacesRouter(placesController));
  app.use(errorHandler);

  return { app };
}

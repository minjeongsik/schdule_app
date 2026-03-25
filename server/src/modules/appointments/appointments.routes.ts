import { Router } from "express";
import { AppointmentsController } from "./appointments.controller.js";

export function createAppointmentsRouter(controller: AppointmentsController) {
  const router = Router();

  router.get("/", controller.list);
  router.get("/:id", controller.get);
  router.post("/", controller.create);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}


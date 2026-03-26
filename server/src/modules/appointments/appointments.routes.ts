import { Router } from "express";
import { AppointmentsController } from "./appointments.controller.js";

export function createAppointmentsRouter(controller: AppointmentsController) {
  const router = Router();

  router.get("/", controller.list);
  router.get("/:id", controller.get);
  router.post("/", controller.create);
  router.post("/:id/routes", controller.createRoute);
  router.patch("/:id", controller.update);
  router.patch("/:id/routes/:routeId", controller.updateRoute);
  router.patch("/:id/routes/:routeId/select", controller.selectRoute);
  router.delete("/:id/routes/:routeId", controller.removeRoute);
  router.delete("/:id", controller.remove);

  return router;
}

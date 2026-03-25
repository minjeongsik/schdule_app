import { Router } from "express";
import { PlacesController } from "./places.controller.js";

export function createPlacesRouter(controller: PlacesController) {
  const router = Router();

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}

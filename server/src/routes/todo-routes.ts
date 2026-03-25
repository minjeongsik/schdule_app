import { Router } from "express";
import { TodoController } from "../controllers/todo-controller.js";

export function createTodoRouter(controller: TodoController) {
  const router = Router();

  router.get("/", controller.list);
  router.get("/:id", controller.get);
  router.post("/", controller.create);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}

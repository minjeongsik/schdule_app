import type { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { TodoService } from "../services/todo-service.js";

export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  list = (_req: Request, res: Response) => {
    logger.debug("controller:listTodos");
    res.json(this.todoService.listTodos());
  };

  get = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    logger.debug({ id }, "controller:getTodo");
    res.json(this.todoService.getTodo(id));
  };

  create = (req: Request, res: Response) => {
    logger.debug({ body: req.body }, "controller:createTodo");
    const todo = this.todoService.createTodo(req.body);
    res.status(201).json(todo);
  };

  update = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    logger.debug({ id, body: req.body }, "controller:updateTodo");
    res.json(this.todoService.updateTodo(id, req.body));
  };

  remove = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    logger.debug({ id }, "controller:deleteTodo");
    this.todoService.deleteTodo(id);
    res.status(204).send();
  };
}

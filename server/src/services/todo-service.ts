import { createTodoSchema, updateTodoSchema } from "../schemas/todo-schema.js";
import { HttpError } from "../utils/http-error.js";
import type { CreateTodoInput, UpdateTodoInput } from "../types/todo.js";
import { TodoRepository } from "../repositories/todo-repository.js";
import { logger } from "../utils/logger.js";

export class TodoService {
  constructor(private readonly repository: TodoRepository) {}

  listTodos() {
    logger.debug("todo-service:listTodos");
    return this.repository.list();
  }

  getTodo(id: number) {
    logger.debug({ id }, "todo-service:getTodo");
    const todo = this.repository.findById(id);
    if (!todo) {
      throw new HttpError(404, "Todo not found");
    }

    return todo;
  }

  createTodo(input: CreateTodoInput) {
    const parsed = createTodoSchema.safeParse(input);
    if (!parsed.success) {
      throw new HttpError(400, "Validation failed", parsed.error.flatten());
    }

    logger.debug({ input: parsed.data }, "todo-service:createTodo");
    return this.repository.create(parsed.data.title, parsed.data.description);
  }

  updateTodo(id: number, input: UpdateTodoInput) {
    const parsed = updateTodoSchema.safeParse(input);
    if (!parsed.success) {
      throw new HttpError(400, "Validation failed", parsed.error.flatten());
    }

    logger.debug({ id, input: parsed.data }, "todo-service:updateTodo");
    const todo = this.repository.update(id, parsed.data);
    if (!todo) {
      throw new HttpError(404, "Todo not found");
    }

    return todo;
  }

  deleteTodo(id: number) {
    logger.debug({ id }, "todo-service:deleteTodo");
    const deleted = this.repository.remove(id);
    if (!deleted) {
      throw new HttpError(404, "Todo not found");
    }
  }
}

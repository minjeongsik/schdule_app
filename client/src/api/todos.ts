import type { Todo, TodoFormValues } from "../types/todo";
import { apiRequest } from "./client";

export function fetchTodos() {
  return apiRequest<Todo[]>("/todos");
}

export function fetchTodo(id: string) {
  return apiRequest<Todo>(`/todos/${id}`);
}

export function createTodo(values: TodoFormValues) {
  return apiRequest<Todo>("/todos", {
    method: "POST",
    body: JSON.stringify(values)
  });
}

export function updateTodo(id: number, values: Partial<TodoFormValues> & { completed?: boolean }) {
  return apiRequest<Todo>(`/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(values)
  });
}

export async function deleteTodo(id: number) {
  await apiRequest<null>(`/todos/${id}`, {
    method: "DELETE"
  });
}

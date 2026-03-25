import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTodo, deleteTodo, fetchTodo, fetchTodos, updateTodo } from "../api/todos";

export function useTodos() {
  return useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos
  });
}

export function useTodo(id?: string) {
  return useQuery({
    queryKey: ["todo", id],
    queryFn: () => fetchTodo(id!),
    enabled: Boolean(id)
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTodo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: Parameters<typeof updateTodo>[1] }) => updateTodo(id, values),
    onSuccess: async (todo) => {
      await queryClient.invalidateQueries({ queryKey: ["todos"] });
      await queryClient.invalidateQueries({ queryKey: ["todo", String(todo.id)] });
    }
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTodo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });
}

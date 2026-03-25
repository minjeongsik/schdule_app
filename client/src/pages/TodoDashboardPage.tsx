import { useNavigate, useParams } from "react-router-dom";
import { DebugPanel } from "../components/DebugPanel";
import { TodoDetail } from "../components/TodoDetail";
import { TodoForm } from "../components/TodoForm";
import { TodoList } from "../components/TodoList";
import { useCreateTodo, useDeleteTodo, useTodo, useTodos, useUpdateTodo } from "../hooks/use-todos";
import type { Todo } from "../types/todo";

export function TodoDashboardPage() {
  const navigate = useNavigate();
  const params = useParams();
  const selectedTodoId = params.id;
  const { data: todos = [], isLoading, error } = useTodos();
  const selectedTodoQuery = useTodo(selectedTodoId);
  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();
  const editingTodo = todos.find((todo) => todo.id === Number(selectedTodoId));

  async function handleCreate(values: { title: string; description: string }) {
    await createMutation.mutateAsync(values);
  }

  async function handleEdit(values: { title: string; description: string }) {
    if (!editingTodo) {
      return;
    }

    await updateMutation.mutateAsync({
      id: editingTodo.id,
      values
    });
  }

  async function handleToggleComplete(todo: Todo) {
    await updateMutation.mutateAsync({
      id: todo.id,
      values: { completed: !todo.completed }
    });
  }

  async function handleDelete(todo: Todo) {
    console.debug("ui:delete", { id: todo.id });
    await deleteMutation.mutateAsync(todo.id);

    if (selectedTodoId === String(todo.id)) {
      navigate("/");
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Fullstack Test App</p>
        <h1>Todo CRUD Lab</h1>
        <p className="hero-copy">
          Frontend and backend are wired for CRUD, validation, request tracing, and local debugging.
        </p>
      </section>

      {error ? <p className="banner-error">Failed to load todos. Check the server logs and API URL.</p> : null}

      <section className="content-grid">
        <TodoForm
          mode={editingTodo ? "edit" : "create"}
          initialValue={editingTodo}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={editingTodo ? handleEdit : handleCreate}
          onCancel={editingTodo ? () => navigate("/") : undefined}
        />

        <TodoList
          todos={todos}
          activeTodoId={editingTodo?.id}
          onToggleComplete={handleToggleComplete}
          onEdit={(todo) => navigate(`/todos/${todo.id}`)}
          onDelete={handleDelete}
          isUpdating={updateMutation.isPending || deleteMutation.isPending}
        />

        <TodoDetail
          todo={selectedTodoQuery.data}
          isLoading={selectedTodoQuery.isLoading}
          error={selectedTodoQuery.error instanceof Error ? selectedTodoQuery.error.message : undefined}
        />
      </section>

      <DebugPanel todos={todos} activeTodoId={selectedTodoId} mode={editingTodo ? "edit" : "create"} />

      {isLoading ? <p className="footer-note">Loading todos...</p> : null}
    </main>
  );
}

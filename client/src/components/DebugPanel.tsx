import type { Todo } from "../types/todo";

interface DebugPanelProps {
  todos: Todo[];
  activeTodoId?: string;
  mode: "create" | "edit";
}

export function DebugPanel({ todos, activeTodoId, mode }: DebugPanelProps) {
  return (
    <section className="panel debug-panel">
      <div className="panel-header">
        <h2>Debug Snapshot</h2>
        <span className="badge">{mode}</span>
      </div>
      <pre>
        {JSON.stringify(
          {
            activeTodoId: activeTodoId ?? null,
            totalTodos: todos.length,
            completedCount: todos.filter((todo) => todo.completed).length,
            titles: todos.map((todo) => todo.title)
          },
          null,
          2
        )}
      </pre>
    </section>
  );
}

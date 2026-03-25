import { Link } from "react-router-dom";
import type { Todo } from "../types/todo";

interface TodoListProps {
  todos: Todo[];
  activeTodoId?: number;
  onToggleComplete: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  isUpdating: boolean;
}

export function TodoList({ todos, activeTodoId, onToggleComplete, onEdit, onDelete, isUpdating }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <section className="panel list-panel">
        <h2>Todo List</h2>
        <p className="muted-text">No todos yet. Add one to test the CRUD flow.</p>
      </section>
    );
  }

  return (
    <section className="panel list-panel">
      <div className="panel-header">
        <h2>Todo List</h2>
        <span className="badge">{todos.length} items</span>
      </div>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.id === activeTodoId ? "todo-card active" : "todo-card"}>
            <div className="todo-card-top">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  disabled={isUpdating}
                  onChange={() => onToggleComplete(todo)}
                />
                <span className={todo.completed ? "completed-title" : undefined}>{todo.title}</span>
              </label>
              <span className={todo.completed ? "status-done" : "status-open"}>
                {todo.completed ? "Done" : "Open"}
              </span>
            </div>
            <p>{todo.description || "No description"}</p>
            <div className="todo-actions">
              <Link to={`/todos/${todo.id}`} className="ghost-button">
                View
              </Link>
              <button type="button" className="ghost-button" onClick={() => onEdit(todo)}>
                Edit
              </button>
              <button type="button" className="danger-button" onClick={() => onDelete(todo)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

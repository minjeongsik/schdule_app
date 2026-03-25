import type { Todo } from "../types/todo";

interface TodoDetailProps {
  todo?: Todo;
  isLoading: boolean;
  error?: string;
}

export function TodoDetail({ todo, isLoading, error }: TodoDetailProps) {
  return (
    <aside className="panel detail-panel">
      <div className="panel-header">
        <h2>Detail</h2>
        {todo ? <span className="badge">#{todo.id}</span> : null}
      </div>
      {isLoading ? <p className="muted-text">Loading selected todo...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!isLoading && !error && !todo ? <p className="muted-text">Select a todo to inspect its state.</p> : null}
      {todo ? (
        <div className="detail-grid">
          <div>
            <strong>Title</strong>
            <p>{todo.title}</p>
          </div>
          <div>
            <strong>Status</strong>
            <p>{todo.completed ? "Completed" : "Open"}</p>
          </div>
          <div>
            <strong>Description</strong>
            <p>{todo.description || "No description"}</p>
          </div>
          <div>
            <strong>Created</strong>
            <p>{new Date(todo.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <strong>Updated</strong>
            <p>{new Date(todo.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

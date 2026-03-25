import { useEffect, useState } from "react";
import type { Todo, TodoFormValues } from "../types/todo";

interface TodoFormProps {
  mode: "create" | "edit";
  initialValue?: Todo | null;
  isSubmitting: boolean;
  onSubmit: (values: TodoFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function TodoForm({ mode, initialValue, isSubmitting, onSubmit, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(initialValue?.title ?? "");
    setDescription(initialValue?.description ?? "");
  }, [initialValue]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    console.debug("ui:submit", { mode, trimmedTitle, trimmedDescription });

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    setError("");
    await onSubmit({
      title: trimmedTitle,
      description: trimmedDescription
    });

    if (mode === "create") {
      setTitle("");
      setDescription("");
    }
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <h2>{mode === "create" ? "Create Todo" : "Edit Todo"}</h2>
        {mode === "edit" && onCancel ? (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
      <label>
        Title
        <input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Write the test plan"
        />
      </label>
      <label>
        Description
        <textarea
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add logs around the failure path"
          rows={4}
        />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : mode === "create" ? "Add Todo" : "Save Changes"}
      </button>
    </form>
  );
}

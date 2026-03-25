import type Database from "better-sqlite3";
import type { Todo } from "../types/todo.js";

interface TodoRow {
  id: number;
  title: string;
  description: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class TodoRepository {
  constructor(private readonly db: Database.Database) {}

  list(): Todo[] {
    const rows = this.db
      .prepare("SELECT * FROM todos ORDER BY id DESC")
      .all() as TodoRow[];

    return rows.map(mapRow);
  }

  findById(id: number): Todo | undefined {
    const row = this.db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as TodoRow | undefined;
    return row ? mapRow(row) : undefined;
  }

  create(title: string, description: string): Todo {
    const now = new Date().toISOString();
    const result = this.db
      .prepare(
        "INSERT INTO todos (title, description, completed, created_at, updated_at) VALUES (?, ?, 0, ?, ?)"
      )
      .run(title, description, now, now);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  update(id: number, patch: Partial<Pick<Todo, "title" | "description" | "completed">>): Todo | undefined {
    const current = this.findById(id);
    if (!current) {
      return undefined;
    }

    const next = {
      title: patch.title ?? current.title,
      description: patch.description ?? current.description,
      completed: patch.completed ?? current.completed,
      updatedAt: new Date().toISOString()
    };

    this.db
      .prepare("UPDATE todos SET title = ?, description = ?, completed = ?, updated_at = ? WHERE id = ?")
      .run(next.title, next.description, Number(next.completed), next.updatedAt, id);

    return this.findById(id);
  }

  remove(id: number): boolean {
    const result = this.db.prepare("DELETE FROM todos WHERE id = ?").run(id);
    return result.changes > 0;
  }
}

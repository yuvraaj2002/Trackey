import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { Plus } from "lucide-react";
import { api } from "../api/client";
import type { SpendCategory } from "../api/types";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { formatDateTime } from "../lib/format";

type EditorMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "delete"; category: SpendCategory };

export function CategoriesPage() {
  const [categories, setCategories] = useState<SpendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorMode>({ type: "closed" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCategories(await api.listCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;

    setSaving(true);
    setError(null);
    try {
      await api.createCategory(name);
      setEditor({ type: "closed" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (editor.type !== "delete") return;
    setSaving(true);
    setError(null);
    try {
      await api.deleteCategory(editor.category.id);
      setEditor({ type: "closed" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Categories"
        description="Simple buckets for grouping spends."
        actions={
          <Button variant="primary" onClick={() => setEditor({ type: "create" })}>
            <Plus size={16} strokeWidth={1.75} aria-hidden />
            Add category
          </Button>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}

      {loading ? (
        <p className="muted">Loading categories…</p>
      ) : categories.length === 0 ? (
        <div className="empty">
          <h2>No categories</h2>
          <p>Create a category before logging spends.</p>
          <Button variant="primary" onClick={() => setEditor({ type: "create" })}>
            <Plus size={16} strokeWidth={1.75} aria-hidden />
            Add category
          </Button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table" style={{ "--cols": 4 } as CSSProperties}>
            <colgroup>
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th className="col-name" scope="col">
                  Name
                </th>
                <th className="col-created" scope="col">
                  Created (IST)
                </th>
                <th className="col-status" scope="col">
                  Status
                </th>
                <th className="col-actions" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="col-name title">{category.name}</td>
                  <td className="col-created cell-muted">{formatDateTime(category.created_at)}</td>
                  <td className="col-status cell-muted" style={{ textTransform: "capitalize" }}>
                    {category.status}
                  </td>
                  <td className="col-actions cell-actions">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setEditor({ type: "delete", category })}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editor.type === "create" ? (
        <Modal
          title="Add category"
          hint="Names should be short and reusable."
          onClose={() => setEditor({ type: "closed" })}
        >
          <form className="form-stack" onSubmit={(event) => void handleCreate(event)}>
            <div className="field">
              <label className="field-label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                className="input"
                required
                maxLength={255}
                placeholder="Groceries"
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setEditor({ type: "closed" })}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {editor.type === "delete" ? (
        <Modal
          title="Delete category"
          hint={
            <>
              Soft-delete <strong>{editor.category.name}</strong>? It will leave the active list.
            </>
          }
          onClose={() => setEditor({ type: "closed" })}
          labelledBy="category-delete-title"
        >
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setEditor({ type: "closed" })}>
              Cancel
            </Button>
            <Button variant="danger-solid" disabled={saving} onClick={() => void handleDelete()}>
              {saving ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

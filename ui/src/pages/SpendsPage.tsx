import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { Plus } from "lucide-react";
import { api } from "../api/client";
import type { Spend, SpendCategory } from "../api/types";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { RowActionDock } from "../components/RowActionDock";
import { Select } from "../components/Select";
import { formatDateTime, formatMoney } from "../lib/format";

type EditorMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; spend: Spend }
  | { type: "delete"; spend: Spend };

export function SpendsPage() {
  const [spends, setSpends] = useState<Spend[]>([]);
  const [categories, setCategories] = useState<SpendCategory[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [createCategoryId, setCreateCategoryId] = useState("");
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorMode>({ type: "closed" });
  const [saving, setSaving] = useState(false);

  const categoryName = useCallback(
    (id: number) => categories.find((category) => category.id === id)?.name ?? `Category #${id}`,
    [categories],
  );

  const filterOptions = useMemo(
    () => [
      { value: "", label: "All categories" },
      ...categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    ],
    [categories],
  );

  const createOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categories],
  );

  const load = useCallback(
    async (cursor?: number, append = false) => {
      setLoading(true);
      setError(null);
      try {
        const [list, cats] = await Promise.all([
          api.listSpends({
            category_id: categoryFilter ? Number(categoryFilter) : undefined,
            cursor,
          }),
          append ? Promise.resolve(categories) : api.listCategories(),
        ]);
        if (!append) {
          setCategories(cats);
          setSpends(list.items);
        } else {
          setSpends((current) => [...current, ...list.items]);
        }
        setNextCursor(list.next_cursor);
        setHasMore(list.has_more);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load spends");
      } finally {
        setLoading(false);
      }
    },
    [categories, categoryFilter],
  );

  useEffect(() => {
    void load();
    // Intentionally refresh when the filter changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  function openCreate() {
    const initial =
      categoryFilter || (categories[0] ? String(categories[0].id) : "");
    setCreateCategoryId(initial);
    setEditor({ type: "create" });
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editor.type !== "create" && editor.type !== "edit") return;

    const form = new FormData(event.currentTarget);
    const label = String(form.get("label") ?? "").trim();
    const amount = String(form.get("amount") ?? "").trim();

    setSaving(true);
    setError(null);
    try {
      if (editor.type === "create") {
        if (!createCategoryId) {
          setError("Choose a category");
          setSaving(false);
          return;
        }
        await api.createSpend({
          label,
          amount,
          category_id: Number(createCategoryId),
        });
      } else {
        await api.updateSpend(editor.spend.id, { label, amount });
      }
      setEditor({ type: "closed" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save spend");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (editor.type !== "delete") return;
    setSaving(true);
    setError(null);
    try {
      await api.deleteSpend(editor.spend.id);
      setEditor({ type: "closed" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete spend");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Spends"
        description="A quiet ledger of where money went."
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} strokeWidth={1.75} aria-hidden />
            Add spend
          </Button>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="stack">
        <div className="toolbar">
          <div className="field" style={{ minWidth: 220 }}>
            <label className="field-label" htmlFor="category-filter">
              Category
            </label>
            <Select
              id="category-filter"
              label="Category"
              value={categoryFilter}
              options={filterOptions}
              onChange={setCategoryFilter}
            />
          </div>
        </div>

        {loading && spends.length === 0 ? (
          <p className="muted">Loading spends…</p>
        ) : spends.length === 0 ? (
          <div className="empty">
            <h2>No spends yet</h2>
            <p>Add your first entry to start a calm record of spending.</p>
            <Button variant="primary" onClick={openCreate}>
              <Plus size={16} strokeWidth={1.75} aria-hidden />
              Add spend
            </Button>
          </div>
        ) : (
          <div className="table-wrap">
            <table
              className="data-table spends-table"
              style={{ "--cols": 6 } as CSSProperties}
            >
              <colgroup>
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th className="col-label" scope="col">
                    Label
                  </th>
                  <th className="col-category" scope="col">
                    Category
                  </th>
                  <th className="col-amount" scope="col">
                    Amount
                  </th>
                  <th className="col-created" scope="col">
                    Created (IST)
                  </th>
                  <th className="col-updated" scope="col">
                    Updated (IST)
                  </th>
                  <th className="col-tools" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {spends.map((spend) => (
                  <tr key={spend.id}>
                    <td className="col-label title">{spend.label}</td>
                    <td className="col-category cell-muted">{categoryName(spend.category_id)}</td>
                    <td className="col-amount cell-amount">{formatMoney(spend.amount)}</td>
                    <td className="col-created cell-muted">{formatDateTime(spend.created_at)}</td>
                    <td className="col-updated cell-muted">{formatDateTime(spend.updated_at)}</td>
                    <td className="col-tools">
                      <RowActionDock
                        onEdit={() => setEditor({ type: "edit", spend })}
                        onDelete={() => setEditor({ type: "delete", spend })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {hasMore && nextCursor != null ? (
          <Button variant="ghost" wide disabled={loading} onClick={() => void load(nextCursor, true)}>
            {loading ? "Loading…" : "Show more"}
          </Button>
        ) : null}
      </div>

      {editor.type === "create" || editor.type === "edit" ? (
        <Modal
          title={editor.type === "create" ? "Add spend" : "Edit spend"}
          hint={
            editor.type === "create"
              ? "Label, amount, and a category keep the ledger tidy."
              : "Update the label or amount. Category stays put."
          }
          onClose={() => setEditor({ type: "closed" })}
        >
          <form className="form-stack" onSubmit={(event) => void handleSave(event)}>
            <div className="field">
              <label className="field-label" htmlFor="label">
                Label
              </label>
              <input
                id="label"
                name="label"
                className="input"
                required
                maxLength={255}
                defaultValue={editor.type === "edit" ? editor.spend.label : ""}
                placeholder="Weekly groceries"
                autoFocus
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="amount">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                className="input"
                required
                inputMode="decimal"
                defaultValue={editor.type === "edit" ? editor.spend.amount : ""}
                placeholder="120.50"
              />
            </div>
            {editor.type === "create" ? (
              <div className="field">
                <label className="field-label" htmlFor="category_id">
                  Category
                </label>
                <Select
                  id="category_id"
                  label="Category"
                  value={createCategoryId}
                  options={createOptions}
                  onChange={setCreateCategoryId}
                  placeholder="Select category"
                />
              </div>
            ) : null}
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
          title="Delete spend"
          hint={
            <>
              Permanently remove <strong>{editor.spend.label}</strong> ({formatMoney(editor.spend.amount)})?
              This cannot be undone.
            </>
          }
          onClose={() => setEditor({ type: "closed" })}
          labelledBy="spend-delete-title"
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

import { Pencil, Trash2 } from "lucide-react";

type RowActionDockProps = {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
};

/** Always-visible icon tools — compact enough for equal-width table columns. */
export function RowActionDock({
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
}: RowActionDockProps) {
  return (
    <div className="action-dock" role="group" aria-label="Row actions">
      <button
        type="button"
        className="action-chip edit"
        onClick={onEdit}
        aria-label={editLabel}
        title={editLabel}
      >
        <Pencil size={15} strokeWidth={1.75} aria-hidden />
      </button>
      <button
        type="button"
        className="action-chip delete"
        onClick={onDelete}
        aria-label={deleteLabel}
        title={deleteLabel}
      >
        <Trash2 size={15} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}

import { useEffect, type ReactNode } from "react";

type ModalProps = {
  title: string;
  hint?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
};

export function Modal({ title, hint, onClose, children, labelledBy = "modal-title" }: ModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id={labelledBy}>{title}</h2>
        {hint ? <p className="hint">{hint}</p> : null}
        {children}
      </div>
    </div>
  );
}

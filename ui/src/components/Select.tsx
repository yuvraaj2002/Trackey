import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption<T extends string | number> = {
  value: T;
  label: string;
};

type SelectProps<T extends string | number> = {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  label: string;
  id?: string;
  placeholder?: string;
};

export function Select<T extends string | number>({
  value,
  options,
  onChange,
  label,
  id,
  placeholder = "Select…",
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const hasValue = options.some((option) => option.value === value);
  const [active, setActive] = useState(selectedIndex);
  const wrap = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const listId = useId();
  const triggerId = id ?? listId;

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const item = menu.current?.children[active] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function show() {
    const rect = wrap.current?.getBoundingClientRect();
    setUp(Boolean(rect && rect.bottom + 280 > window.innerHeight && rect.top > 280));
    setActive(hasValue ? selectedIndex : 0);
    setOpen(true);
  }

  function pick(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  }

  function onKey(event: ReactKeyboardEvent) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        show();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(options.length - 1, current + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(0, current - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pick(active);
    }
  }

  const selectedLabel = hasValue ? options[selectedIndex]?.label : placeholder;

  return (
    <div className="app-select" ref={wrap}>
      <button
        type="button"
        id={triggerId}
        className={`app-select-trigger${open ? " open" : ""}`}
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${listId}-list`}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKey}
      >
        <span className={!hasValue ? "placeholder" : undefined}>{selectedLabel}</span>
        <ChevronDown size={16} strokeWidth={1.75} aria-hidden className="app-select-caret" />
      </button>
      {open ? (
        <ul
          id={`${listId}-list`}
          ref={menu}
          role="listbox"
          aria-label={label}
          className={`app-select-menu${up ? " up" : ""}`}
        >
          {options.map((option, index) => (
            <li
              key={String(option.value)}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={index === active ? "active" : undefined}
              onMouseEnter={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(index)}
            >
              <span>{option.label}</span>
              {option.value === value ? (
                <Check size={15} strokeWidth={1.75} aria-hidden className="app-select-check" />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

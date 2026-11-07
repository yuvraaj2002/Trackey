import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-solid";
type Size = "md" | "sm";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  wide?: boolean;
  children: ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  "danger-solid": "btn-danger-solid",
};

export function Button({
  variant = "secondary",
  size = "md",
  wide = false,
  className = "",
  type,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={`btn ${variantClass[variant]} ${size === "sm" ? "btn-sm" : ""} ${wide ? "btn-wide" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

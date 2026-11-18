import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

const base =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 py-2 text-base font-semibold " +
  "transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus " +
  "disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled sm:w-auto";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover",
  secondary: "bg-primary-soft text-primary-soft-text hover:bg-primary-soft-hover",
  ghost: "bg-transparent text-primary underline hover:text-primary-hover",
};

/** Same look for `<a>` elements that act as buttons. */
export function buttonClass(variant: ButtonVariant = "primary", className = ""): string {
  return `${base} ${variants[variant]} ${className}`.trim();
}

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  type = "button",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, className)}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
}

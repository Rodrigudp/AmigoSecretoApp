import { useId } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
};

function describe(inputId: string, hint?: string, error?: string) {
  const ids = [hint ? `${inputId}-hint` : "", error ? `${inputId}-error` : ""].filter(Boolean);
  return ids.join(" ") || undefined;
}

export function Input({ label, hint, error, id, className = "", required, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = describe(inputId, hint, error);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-lg font-semibold">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      ) : null}
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={
          "min-h-12 w-full rounded-xl border-2 bg-surface px-4 text-base " +
          "focus-visible:border-focus focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-focus " +
          "disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled " +
          (error ? "border-danger " : "border-border ") +
          className
        }
        {...rest}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-semibold text-danger">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

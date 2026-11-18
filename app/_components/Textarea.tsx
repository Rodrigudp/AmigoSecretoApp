import { useId } from "react";
import type { TextareaHTMLAttributes, Ref } from "react";

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
  ref?: Ref<HTMLTextAreaElement>;
  counter?: boolean;
};

function describe(id: string, hint?: string, error?: string, counter?: string) {
  const ids = [
    hint ? `${id}-hint` : "",
    error ? `${id}-error` : "",
    counter ? `${id}-count` : "",
  ].filter(Boolean);
  return ids.join(" ") || undefined;
}

function TextareaHeader({
  textareaId,
  label,
  required,
  countId,
  count,
}: {
  textareaId: string;
  label: string;
  required?: boolean;
  countId?: string;
  count?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <label htmlFor={textareaId} className="text-sm font-semibold">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {count && (
        <span id={countId} className="text-xs text-text-muted" aria-live="polite">
          {count}
        </span>
      )}
    </div>
  );
}

function TextareaError({ errorId, error }: { errorId: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={errorId} role="alert" className="text-sm font-semibold text-danger">
      <span aria-hidden="true">⚠ </span>
      {error}
    </p>
  );
}

function getTextareaClassName(error?: string, extraClass = ""): string {
  const border = error ? "border-danger " : "border-border ";
  return (
    "w-full min-w-0 rounded-lg border bg-surface p-3 text-base text-text " +
    "placeholder:text-text-muted " +
    "focus-visible:border-focus focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-focus " +
    "disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled " +
    border +
    extraClass
  );
}

export function Textarea({
  label,
  hint,
  error,
  id,
  className = "",
  required,
  maxLength,
  counter = true,
  value,
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;
  const countId = `${textareaId}-count`;
  const len = typeof value === "string" ? value.length : 0;
  const showCounter = Boolean(maxLength && counter);
  const countText = showCounter ? `${len}/${maxLength}` : undefined;
  const describedBy = describe(textareaId, hint, error, showCounter ? countId : undefined);

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <TextareaHeader
        textareaId={textareaId}
        label={label}
        required={required}
        countId={countId}
        count={countText}
      />
      {hint && (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
      <textarea
        id={textareaId}
        rows={3}
        maxLength={maxLength}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={getTextareaClassName(error, className)}
        {...rest}
      />
      <TextareaError errorId={errorId} error={error} />
    </div>
  );
}

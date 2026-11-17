import type { ReactNode } from "react";

export type CardTone = "default" | "warning" | "success" | "danger";

type CardProps = {
  tone?: CardTone;
  title?: string;
  as?: "section" | "article" | "div";
  className?: string;
  children?: ReactNode;
};

const tones: Record<CardTone, string> = {
  default: "bg-surface border-border text-text",
  warning: "bg-warning-bg border-warning text-warning",
  success: "bg-success-bg border-success text-success",
  danger: "bg-danger-bg border-danger text-danger",
};

const icons: Record<CardTone, string> = { default: "", warning: "⚠ ", success: "✓ ", danger: "⚠ " };

export function Card({
  tone = "default",
  title,
  as: Tag = "section",
  className = "",
  children,
}: CardProps) {
  return (
    <Tag
      data-tone={tone}
      className={`rounded-2xl border p-4 shadow-sm sm:p-6 ${tones[tone]} ${className}`.trim()}
    >
      {title ? (
        <h2 className="mb-2 text-lg font-semibold">
          <span aria-hidden="true">{icons[tone]}</span>
          {title}
        </h2>
      ) : null}
      {children}
    </Tag>
  );
}

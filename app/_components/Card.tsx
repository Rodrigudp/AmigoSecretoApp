import type { ReactNode } from "react";

export type CardTone = "default" | "warning" | "success" | "danger";

type CardProps = {
  tone?: CardTone;
  title?: string;
  heading?: "h1" | "h2";
  as?: "section" | "article" | "div";
  className?: string;
  children?: ReactNode;
};

const tones: Record<CardTone, string> = {
  default: "",
  warning: "border-[#ecd998] bg-warning-bg text-warning",
  success: "border-[#bfdbc9] bg-success-bg text-success",
  danger: "border-[#efc4bd] bg-danger-bg text-danger",
};

const icons: Record<CardTone, string> = { default: "", warning: "⚠ ", success: "✓ ", danger: "⚠ " };

export function Card({
  tone = "default",
  title,
  heading: Heading = "h2",
  as: Tag = "section",
  className = "",
  children,
}: CardProps) {
  const hasBody = children != null && children !== false;
  const titleClass =
    Heading === "h1"
      ? `page-title${hasBody ? " mb-3" : ""}`
      : `text-lg font-semibold tracking-tight wrap-break-word${hasBody ? " mb-3" : ""}`;
  return (
    <Tag data-tone={tone} className={`paper-panel min-w-0 ${tones[tone]} ${className}`.trim()}>
      {title ? (
        <Heading className={titleClass}>
          <span aria-hidden="true">{icons[tone]}</span>
          {title}
        </Heading>
      ) : null}
      {children}
    </Tag>
  );
}

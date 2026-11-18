"use client";

import { useRef, useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";

type CopyFieldProps = { label: string; value: string; copyLabel: string };

export function CopyField({ label, value, copyLabel }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        ref={inputRef}
        label={label}
        value={value}
        readOnly
        onFocus={(e) => e.currentTarget.select()}
        className="border-dashed"
      />
      <Button variant="secondary" onClick={copy} aria-live="polite">
        {copied ? "✓ Link copiado!" : copyLabel}
      </Button>
    </div>
  );
}

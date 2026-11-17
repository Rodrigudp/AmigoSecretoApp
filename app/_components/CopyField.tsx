"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";

type CopyFieldProps = { label: string; value: string; copyLabel: string };

export function CopyField({ label, value, copyLabel }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        label={label}
        value={value}
        readOnly
        onFocus={(e) => e.currentTarget.select()}
        className="border-dashed"
      />
      <Button variant="secondary" onClick={copy}>
        {copyLabel}
      </Button>
      <p role="status" className="min-h-6 text-sm text-success">
        {copied ? "✓ Link copiado!" : ""}
      </p>
    </div>
  );
}

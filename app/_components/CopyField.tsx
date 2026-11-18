"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { copy as text } from "../_lib/copy";

type CopyFieldProps = { label: string; value: string; copyLabel: string; children?: ReactNode };

export function CopyField({ label, value, copyLabel, children }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  async function copy() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try {
      await navigator.clipboard.writeText(value);
      setFailed(false);
      setCopied(true);
      timeoutRef.current = setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
      setFailed(true);
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
      <div className="flex flex-col gap-2 min-[641px]:flex-row min-[641px]:flex-wrap">
        <Button variant="secondary" onClick={copy}>
          {copied ? text.GLB_11 : copyLabel}
        </Button>
        {children}
      </div>
      <span role="status" className="sr-only">
        {copied ? text.GLB_11 : ""}
      </span>
      {failed ? (
        <p role="alert" className="text-sm text-danger">
          {text.GLB_12}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import { copy } from "../_lib/copy";
import { normalizeUrl } from "@/src/application/schemas/wish-item";
import { Button } from "./Button";
import { Input } from "./Input";
import { Textarea } from "./Textarea";

export type WishFormData = {
  title: string;
  url: string | null;
  note: string | null;
};

type WishFormProps = {
  initialValues?: WishFormData;
  isEdit?: boolean;
  onSave: (data: WishFormData) => Promise<boolean | void>;
  onCancel: () => void;
};

type FormErrors = {
  title?: string;
  url?: string;
  note?: string;
};

function validateUrlField(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("http://")) return copy.WSH_17.http;
  const unsupported = ["javascript:", "data:", "file:", "ftp:", "mailto:"];
  if (unsupported.some((s) => lower.startsWith(s))) return copy.WSH_17.unsupported;
  const norm = normalizeUrl(trimmed);
  if (!norm.ok) {
    return norm.code === "url_too_long" ? copy.WSH_17.tooLong : copy.WSH_17.invalid;
  }
  return null;
}

function validateWishForm(title: string, note: string, url: string): FormErrors {
  const errors: FormErrors = {};
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    errors.title = copy.WSH_15.empty;
  } else if (trimmedTitle.length > 80) {
    errors.title = copy.WSH_15.tooLong;
  }
  if (note.trim().length > 200) {
    errors.note = copy.WSH_16;
  }
  const urlError = validateUrlField(url);
  if (urlError) {
    errors.url = urlError;
  }
  return errors;
}

function focusFirstError(
  errors: FormErrors,
  refs: {
    title: RefObject<HTMLInputElement | null>;
    url: RefObject<HTMLInputElement | null>;
    note: RefObject<HTMLTextAreaElement | null>;
  }
): boolean {
  if (errors.title) {
    refs.title.current?.focus();
    return true;
  }
  if (errors.url) {
    refs.url.current?.focus();
    return true;
  }
  if (errors.note) {
    refs.note.current?.focus();
    return true;
  }
  return false;
}

function resolveNormalizedUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  const norm = normalizeUrl(trimmed);
  return norm.ok ? norm.url : null;
}

function getSaveLabel(loading: boolean, isEdit: boolean): string {
  if (loading) return copy.WSH_11.saving;
  return isEdit ? copy.WSH_11.saveEdit : copy.WSH_11.save;
}

export function WishForm({ initialValues, isEdit = false, onSave, onCancel }: WishFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [url, setUrl] = useState(initialValues?.url ?? "");
  const [note, setNote] = useState(initialValues?.note ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors = validateWishForm(title, note, url);
    setErrors(newErrors);
    if (
      focusFirstError(newErrors, { title: titleInputRef, url: urlInputRef, note: noteInputRef })
    ) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        url: resolveNormalizedUrl(url),
        note: note.trim() || null,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <h3 className="text-base font-semibold text-text">
        {isEdit ? copy.WSH_07.edit : copy.WSH_07.new}
      </h3>

      <Input
        ref={titleInputRef}
        name="title"
        label={copy.WSH_08.label}
        placeholder={copy.WSH_08.placeholder}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={80}
        required
        error={errors.title}
      />

      <Input
        ref={urlInputRef}
        name="url"
        type="url"
        inputMode="url"
        autoCapitalize="off"
        autoComplete="off"
        label={copy.WSH_09.label}
        hint={copy.WSH_09.hint}
        placeholder={copy.WSH_09.placeholder}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={() => {
          const urlError = validateUrlField(url);
          setErrors((prev) => ({ ...prev, url: urlError ?? undefined }));
        }}
        error={errors.url}
      />

      <Textarea
        ref={noteInputRef}
        name="note"
        label={copy.WSH_10.label}
        hint={copy.WSH_10.hint}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={200}
        error={errors.note}
      />

      <div className="mt-1 flex flex-col gap-2 min-[641px]:flex-row min-[641px]:flex-wrap">
        <Button type="submit" variant="primary" loading={loading}>
          {getSaveLabel(loading, isEdit)}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          {copy.WSH_11.cancel}
        </Button>
      </div>
    </form>
  );
}

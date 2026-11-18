"use client";

import { useEffect, useRef, useState } from "react";
import type { WishItem as WishItemType } from "@/src/application/ports";
import { copy } from "../_lib/copy";
import { Button, buttonClass } from "./Button";
import { WishForm, type WishFormData } from "./WishForm";

type WishItemProps = {
  item: WishItemType;
  mode: "owner" | "reader";
  isEditing?: boolean;
  onStartEdit?: (id: string) => void;
  onCancelEdit?: () => void;
  onSaveEdit?: (id: string, data: WishFormData) => Promise<boolean | void>;
  onDelete?: (id: string) => Promise<void>;
};

function getDomain(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./i, "");
  } catch {
    return rawUrl;
  }
}

export function StoreBadge({ domain, affiliate }: { domain: string; affiliate?: boolean }) {
  if (affiliate) {
    return (
      <span className="inline-flex items-center rounded bg-[#FFF0BB] px-2 py-0.5 text-base font-medium text-text">
        {copy.WSH_19.affiliate(domain)}
      </span>
    );
  }
  return <span className="text-base text-text-muted">{copy.WSH_19.common(domain)}</span>;
}

function WishItemStoreLink({ href, isAffiliate }: { href: string; isAffiliate: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel={isAffiliate ? "sponsored nofollow noopener noreferrer" : "nofollow noopener noreferrer"}
      className={buttonClass("secondary") + " min-h-11 inline-flex items-center text-sm"}
    >
      {copy.WSH_13.store}
    </a>
  );
}

function WishItemActions({
  id,
  title,
  linkHref,
  isAffiliate,
  mode,
  onEdit,
  onDeletePrompt,
}: {
  id: string;
  title: string;
  linkHref: string | null;
  isAffiliate: boolean;
  mode: "owner" | "reader";
  onEdit?: () => void;
  onDeletePrompt?: () => void;
}) {
  const storeLink = linkHref ? (
    <WishItemStoreLink href={linkHref} isAffiliate={isAffiliate} />
  ) : null;

  if (mode !== "owner") {
    return storeLink ? <div className="self-start">{storeLink}</div> : null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 self-start">
      {storeLink}
      <Button
        id={`edit-btn-${id}`}
        type="button"
        variant="ghost"
        onClick={onEdit}
        aria-label={copy.WSH_13.editAria(title)}
      >
        {copy.WSH_13.edit}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={onDeletePrompt}
        aria-label={copy.WSH_13.deleteAria(title)}
      >
        {copy.WSH_13.delete}
      </Button>
    </div>
  );
}

function DeleteConfirm({
  id,
  title,
  deleting,
  onCancel,
  onConfirm,
}: {
  id: string;
  title: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return (
    <div
      role="group"
      aria-labelledby={`confirm-delete-${id}`}
      className="rounded-xl border border-warning bg-warning-bg p-4"
    >
      <p id={`confirm-delete-${id}`} className="text-sm font-semibold text-text">
        {copy.WSH_14.confirm(title)}
      </p>
      <div className="mt-3 flex flex-col gap-2 min-[641px]:flex-row min-[641px]:flex-wrap">
        <Button
          ref={cancelRef}
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={deleting}
        >
          {copy.WSH_14.cancel}
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} loading={deleting}>
          {copy.WSH_14.yes}
        </Button>
      </div>
    </div>
  );
}

function WishItemEditRow({
  item,
  onSaveEdit,
  onCancelEdit,
}: {
  item: WishItemType;
  onSaveEdit: (id: string, data: WishFormData) => Promise<boolean | void>;
  onCancelEdit: () => void;
}) {
  return (
    <li className="py-3">
      <WishForm
        isEdit
        initialValues={{
          title: item.title,
          url: item.url,
          note: item.note,
        }}
        onSave={(data) => onSaveEdit(item.id, data)}
        onCancel={onCancelEdit}
      />
    </li>
  );
}

function WishItemContent({
  id,
  title,
  note,
  domain,
  isAffiliate,
}: {
  id: string;
  title: string;
  note?: string | null;
  domain: string | null;
  isAffiliate: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <h3
        id={`wish-item-title-${id}`}
        tabIndex={-1}
        className="text-base font-semibold text-text wrap-break-word focus:outline-none"
      >
        {title}
      </h3>
      {note && (
        <p className="text-sm text-text-muted whitespace-pre-wrap wrap-break-word">{note}</p>
      )}
      {domain && (
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <StoreBadge domain={domain} affiliate={isAffiliate} />
        </div>
      )}
    </div>
  );
}

export function WishItem({
  item,
  mode,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: WishItemProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (isEditing && onSaveEdit && onCancelEdit) {
    return <WishItemEditRow item={item} onSaveEdit={onSaveEdit} onCancelEdit={onCancelEdit} />;
  }

  const linkHref = item.productLink?.href || item.url;
  const isAffiliate = Boolean(item.productLink?.affiliate);
  const domain = linkHref ? getDomain(linkHref) : null;

  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-col justify-between gap-3 min-[641px]:flex-row min-[641px]:items-start">
        <WishItemContent
          id={item.id}
          title={item.title}
          note={item.note}
          domain={domain}
          isAffiliate={isAffiliate}
        />

        <WishItemActions
          id={item.id}
          title={item.title}
          linkHref={linkHref}
          isAffiliate={isAffiliate}
          mode={mode}
          onEdit={() => onStartEdit?.(item.id)}
          onDeletePrompt={() => setConfirmingDelete(true)}
        />
      </div>

      {confirmingDelete && (
        <DeleteConfirm
          id={item.id}
          title={item.title}
          deleting={deleting}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </li>
  );
}

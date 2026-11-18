"use client";

import { useState } from "react";
import type { GroupStatus, WishItem as WishItemType } from "@/src/application/ports";
import { copy } from "../_lib/copy";
import { Card } from "./Card";
import { Button } from "./Button";
import { WishForm, type WishFormData } from "./WishForm";
import { WishItem } from "./WishItem";
import { addWishItemAction, updateWishItemAction, removeWishItemAction } from "../wish-actions";

type WishListProps = {
  mode: "owner" | "reader";
  initialItems?: WishItemType[];
  drawStatus?: GroupStatus;
  recipientName?: string;
  accessToken?: string;
};

function WishListSubheader({
  count,
  isOwner,
  drawStatus,
}: {
  count: number;
  isOwner: boolean;
  drawStatus: GroupStatus;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-text-muted" aria-live="polite">
        {copy.WSH_02(count)}
      </p>
      {isOwner && (
        <p className="text-sm text-text-muted">
          {drawStatus === "drawn" ? copy.WSH_03.after : copy.WSH_03.before}
        </p>
      )}
    </div>
  );
}

function WishListWarningBanner({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="flex flex-col justify-between gap-2 rounded-xl border border-warning bg-warning-bg p-3 text-sm text-text sm:flex-row sm:items-center"
    >
      <p>
        <span aria-hidden="true">⚠ </span>
        {message}
      </p>
      <Button
        type="button"
        variant="ghost"
        className="min-h-11 self-start sm:self-auto text-xs font-semibold"
        onClick={onDismiss}
      >
        {copy.WSH_18.dismiss}
      </Button>
    </div>
  );
}

function WishListErrorBanner({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex flex-col justify-between gap-2 rounded-xl border border-danger bg-danger-bg p-3 text-sm text-danger sm:flex-row sm:items-center"
    >
      <p>
        <span aria-hidden="true">⚠ </span>
        {message}
      </p>
      <Button
        type="button"
        variant="ghost"
        className="min-h-11 self-start sm:self-auto text-xs font-semibold text-danger"
        onClick={onRetry}
      >
        {copy.WSH_22.retry}
      </Button>
    </div>
  );
}

function WishListEmptyBlock({ isOwner, onAdd }: { isOwner: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col gap-3 py-2">
      <p className="text-base text-text">{isOwner ? copy.WSH_04 : copy.WSH_24.empty}</p>
      {isOwner && (
        <Button type="button" variant="secondary" className="self-start" onClick={onAdd}>
          {copy.WSH_05}
        </Button>
      )}
    </div>
  );
}

function WishListAddBlock({
  isOwner,
  count,
  isAdding,
  isFull,
  onAdd,
}: {
  isOwner: boolean;
  count: number;
  isAdding: boolean;
  isFull: boolean;
  onAdd: () => void;
}) {
  if (!isOwner || count === 0 || isAdding) return null;

  return (
    <div className="flex flex-col gap-1.5 pt-2">
      <Button
        type="button"
        variant="secondary"
        className="self-start"
        disabled={isFull}
        aria-describedby={isFull ? "wishlist-full-hint" : undefined}
        onClick={onAdd}
      >
        {copy.WSH_05}
      </Button>
      {isFull && (
        <p id="wishlist-full-hint" className="text-sm text-text-muted">
          {copy.WSH_06}
        </p>
      )}
    </div>
  );
}

function AffiliateDisclosures({ hasAmazon, hasML }: { hasAmazon: boolean; hasML: boolean }) {
  return (
    <>
      {hasAmazon && (
        <p className="mt-2 border-t border-line pt-3 text-xs text-text-muted">{copy.WSH_20}</p>
      )}
      {hasML && <p className="text-xs text-text-muted">{copy.WSH_21}</p>}
    </>
  );
}

function makeFallbackItem(data: WishFormData): WishItemType {
  return {
    id: "local-" + Date.now(),
    title: data.title,
    url: data.url,
    note: data.note,
    productLink: data.url ? { href: data.url, affiliate: false, store: null } : null,
  };
}

export function WishList({
  mode,
  initialItems = [],
  drawStatus = "open",
  recipientName,
  accessToken,
}: WishListProps) {
  const [items, setItems] = useState<WishItemType[]>(initialItems);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const isOwner = mode === "owner";
  const count = items.length;
  const isFull = count >= 20;

  const hasAmazonAffiliate = items.some(
    (i) => i.productLink?.affiliate && i.productLink.store === "amazon"
  );
  const hasMLAffiliate = items.some(
    (i) => i.productLink?.affiliate && i.productLink.store === "mercadolivre"
  );

  async function handleAdd(data: WishFormData) {
    setErrorMessage(null);
    if (!accessToken) {
      setItems((prev) => [makeFallbackItem(data), ...prev]);
      setIsAdding(false);
      setAnnouncement(copy.WSH_12.saved);
      return;
    }

    const res = await addWishItemAction(accessToken, data);
    if (!res.ok) {
      setErrorMessage(res.message);
      return;
    }

    setItems((prev) => [res.output.item, ...prev]);
    setIsAdding(false);
    setWarningMessage(
      res.output.warning === "AFFILIATE_UNAVAILABLE" ? copy.WSH_18.storeFailure : null
    );
    setAnnouncement(copy.WSH_12.saved);
  }

  async function handleUpdate(id: string, data: WishFormData) {
    setErrorMessage(null);
    if (!accessToken) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                title: data.title,
                url: data.url,
                note: data.note,
                productLink: data.url ? { href: data.url, affiliate: false, store: null } : null,
              }
            : item
        )
      );
      setEditingId(null);
      setAnnouncement(copy.WSH_12.saved);
      return;
    }

    const res = await updateWishItemAction(accessToken, id, data);
    if (!res.ok) {
      setErrorMessage(res.message);
      return;
    }

    setItems((prev) => prev.map((item) => (item.id === id ? res.output.item : item)));
    setEditingId(null);
    setWarningMessage(
      res.output.warning === "AFFILIATE_UNAVAILABLE" ? copy.WSH_18.storeFailure : null
    );
    setAnnouncement(copy.WSH_12.saved);
  }

  async function handleDelete(id: string) {
    setErrorMessage(null);
    if (!accessToken) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setAnnouncement(copy.WSH_12.deleted);
      return;
    }

    const res = await removeWishItemAction(accessToken, id);
    if (!res.ok) {
      setErrorMessage(res.message);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    setAnnouncement(copy.WSH_12.deleted);
  }

  const title = isOwner ? copy.WSH_01 : copy.WSH_24.title(recipientName || "");

  return (
    <Card title={title} heading="h2">
      <div className="flex flex-col gap-4">
        <WishListSubheader count={count} isOwner={isOwner} drawStatus={drawStatus} />

        <span role="status" className="sr-only">
          {announcement}
        </span>

        <WishListWarningBanner message={warningMessage} onDismiss={() => setWarningMessage(null)} />

        <WishListErrorBanner message={errorMessage} onRetry={() => setErrorMessage(null)} />

        {isOwner && isAdding && <WishForm onSave={handleAdd} onCancel={() => setIsAdding(false)} />}

        {count === 0 && !isAdding && (
          <WishListEmptyBlock isOwner={isOwner} onAdd={() => setIsAdding(true)} />
        )}

        {count > 0 && (
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <WishItem
                key={item.id}
                item={item}
                mode={mode}
                isEditing={editingId === item.id}
                onStartEdit={(id) => setEditingId(id)}
                onCancelEdit={() => setEditingId(null)}
                onSaveEdit={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}

        <WishListAddBlock
          isOwner={isOwner}
          count={count}
          isAdding={isAdding}
          isFull={isFull}
          onAdd={() => setIsAdding(true)}
        />

        <AffiliateDisclosures hasAmazon={hasAmazonAffiliate} hasML={hasMLAffiliate} />
      </div>
    </Card>
  );
}

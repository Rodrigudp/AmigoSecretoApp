"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicGroup, RevealedWishItem } from "@/src/application/ports";
import {
  revealMyResultAction,
  type RevealAuthInput,
  type RevealResultOutput,
} from "../reveal-actions";
import { copy } from "../_lib/copy";
import { formatBrl, formatDateBr } from "../_lib/whatsapp";
import { Button } from "./Button";
import { Card } from "./Card";
import { WishList } from "./WishList";

export type RevealCardProps = {
  group: PublicGroup;
  groupId?: string;
  action?: () => Promise<RevealResultOutput>;
};

function readLocationContext(propGroupId?: string): RevealAuthInput | null {
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    const tok = path.match(/^\/p\/(?!g\/)([^/?#]+)/);
    if (tok) return { mode: "token", accessToken: decodeURIComponent(tok[1]!) };
    const grp = path.match(/^\/p\/g\/([^/?#]+)/);
    if (grp) return { mode: "cookie", groupId: propGroupId ?? decodeURIComponent(grp[1]!) };
  }
  return propGroupId ? { mode: "cookie", groupId: propGroupId } : null;
}

export function RevealCard({ group, groupId, action }: RevealCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<{
    friendName: string;
    wishItems: RevealedWishItem[];
  } | null>(null);
  const [justHidden, setJustHidden] = useState(false);
  const nameRef = useRef<HTMLParagraphElement | null>(null);
  const errorRef = useRef<HTMLParagraphElement | null>(null);
  const closedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (revealed) nameRef.current?.focus();
    else if (error) errorRef.current?.focus();
    else if (justHidden) closedRef.current?.querySelector("button")?.focus();
  }, [revealed, error, justHidden]);

  if (group.status === "open") {
    return (
      <Card title={copy.REV_01}>
        <p className="text-base text-text">{copy.REV_02}</p>
      </Card>
    );
  }

  async function handleReveal() {
    setLoading(true);
    setError(null);
    setJustHidden(false);
    try {
      const ctx = readLocationContext(groupId);
      const res = action
        ? await action()
        : ctx
          ? await revealMyResultAction(ctx)
          : ({ ok: false, code: "INVALID_LINK", message: copy.ARE_06.text } as const);
      if (res.ok) setRevealed({ friendName: res.friendName, wishItems: res.wishItems });
      else setError(res.message);
    } catch {
      setError(copy.GLB_08);
    } finally {
      setLoading(false);
    }
  }

  if (revealed) {
    const summary = copy.REV_04.summary(
      formatDateBr(group.exchangeDate),
      formatBrl(group.maxValueCents),
      group.location
    );
    const items = revealed.wishItems.map((i) => ({ ...i, url: i.productLink?.href ?? null }));
    return (
      <div className="flex flex-col gap-6">
        <Card title={copy.REV_01}>
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-text-muted">{copy.REV_04.prefix}</p>
            <p
              ref={nameRef}
              tabIndex={-1}
              aria-label={copy.REV_04.ariaName(revealed.friendName)}
              className="font-accent text-3xl leading-9 font-bold wrap-break-word text-text sm:text-4xl"
            >
              {revealed.friendName}
            </p>
            <p className="mt-1 text-sm text-text wrap-break-word">{summary}</p>
            <p className="text-sm text-text-muted">{copy.REV_04.secret}</p>
            <div className="mt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setRevealed(null);
                  setJustHidden(true);
                }}
              >
                {copy.REV_04.hide}
              </Button>
            </div>
          </div>
        </Card>
        <WishList
          mode="reader"
          recipientName={revealed.friendName}
          initialItems={items}
          drawStatus="drawn"
        />
      </div>
    );
  }

  if (error) {
    return (
      <Card tone="danger" title={copy.REV_01}>
        <div className="flex flex-col items-start gap-4">
          <p ref={errorRef} tabIndex={-1} role="alert" className="text-base text-danger">
            {error}
          </p>
          <Button variant="secondary" loading={loading} onClick={handleReveal}>
            {loading ? copy.REV_03.loading : copy.REV_06.retry}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title={copy.REV_01} className="!bg-peach border-line">
      <div ref={closedRef} className="flex flex-col items-start gap-4">
        <p className="text-base text-text">{copy.REV_03.text}</p>
        <Button variant="primary" loading={loading} onClick={handleReveal}>
          {loading ? copy.REV_03.loading : copy.REV_03.action}
        </Button>
      </div>
    </Card>
  );
}

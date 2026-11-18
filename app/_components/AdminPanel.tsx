"use client";

import { useEffect, useRef, useState } from "react";
import type { AdminGroup, DrawState, ParticipantId } from "@/src/application/ports";
import type { DomainErrorCode } from "@/src/domain/errors";
import { removeParticipantAction, runDrawAction } from "../admin-actions";
import {
  buildDrawNoticeMessage,
  buildInviteMessage,
  formatBrl,
  formatDateBr,
  whatsappUrl,
  type ShareDetails,
} from "../_lib/whatsapp";
import { Button, buttonClass } from "./Button";
import { Card } from "./Card";
import { CopyField } from "./CopyField";
import { copy } from "../_lib/copy";

type DrawActionFn = (
  adminToken: string,
  expectedParticipantCount?: number
) => Promise<{ ok: boolean; drawnAt?: string; code?: DomainErrorCode; message?: string }>;

type AdminPanelProps = {
  initialData: AdminGroup;
  adminToken: string;
  action?: (
    adminToken: string,
    participantId: ParticipantId
  ) => Promise<{ ok: boolean; participantCount?: number; message?: string }>;
  drawAction?: DrawActionFn;
  onReload?: () => void;
};

function DrawSuccessSection({
  drawnDate,
  shareDetails,
  autoFocus,
}: {
  drawnDate: string;
  shareDetails: ShareDetails;
  autoFocus: boolean;
}) {
  const statusRef = useRef<HTMLParagraphElement | null>(null);
  useEffect(() => {
    if (autoFocus) statusRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-line bg-success-bg p-4 text-sm text-text">
        <p ref={statusRef} tabIndex={-1} role="status" className="font-semibold text-success">
          {copy.DRW_06.done(drawnDate)}
        </p>
        <p className="mt-2 text-sm text-text">{copy.DRW_06.text}</p>
        <p className="mt-2 text-sm text-text-muted">{copy.DRW_06.self}</p>
      </div>
      <div>
        <a
          className={buttonClass("secondary")}
          href={whatsappUrl(buildDrawNoticeMessage(shareDetails))}
          target="_blank"
          rel="noopener noreferrer"
        >
          {copy.DRW_06.action}
        </a>
      </div>
    </div>
  );
}

function DrawOpenSection({
  participantCount,
  adminToken,
  drawAction,
  onReload,
  onDrawn,
}: {
  participantCount: number;
  adminToken: string;
  drawAction: DrawActionFn;
  onReload: () => void;
  onDrawn: (drawnAt: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);
  const confirmGroupRef = useRef<HTMLDivElement | null>(null);
  const alertRef = useRef<HTMLDivElement | null>(null);
  const canDraw = participantCount >= 3;

  useEffect(() => {
    if (confirming) confirmGroupRef.current?.querySelector("button")?.focus();
  }, [confirming]);

  useEffect(() => {
    if (error || changed) alertRef.current?.focus();
  }, [error, changed]);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const res = await drawAction(adminToken, participantCount);
      if (res.ok && res.drawnAt) onDrawn(res.drawnAt);
      else if (res.code === "DRAW_MEMBERS_CHANGED") {
        setConfirming(false);
        setChanged(true);
      } else {
        if (res.code === "NOT_ENOUGH_PARTICIPANTS") setConfirming(false);
        setError(res.message ?? copy.DRW_07);
      }
    } catch {
      setError(copy.GLB_08);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">{copy.DRW_01.text}</p>
      {error && (
        <div
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-danger bg-danger-bg p-3 text-sm text-danger"
        >
          <span aria-hidden="true">⚠ </span>
          {error}
        </div>
      )}
      {changed ? (
        <div
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="flex flex-col items-start gap-3 rounded-xl border border-warning bg-warning-bg p-4 text-sm text-warning"
        >
          <p className="font-medium">
            <span aria-hidden="true">⚠ </span>
            {copy.DRW_08.text}
          </p>
          <Button variant="secondary" onClick={onReload}>
            {copy.DRW_08.action}
          </Button>
        </div>
      ) : confirming ? (
        <div
          ref={confirmGroupRef}
          role="group"
          aria-labelledby="draw-confirm-title"
          aria-busy={loading || undefined}
          className="flex flex-col gap-3 rounded-xl border border-warning bg-warning-bg p-4 text-sm text-warning"
        >
          <p id="draw-confirm-title" className="text-base font-semibold text-warning">
            {copy.DRW_04.title}
          </p>
          <p className="text-sm text-warning">{copy.DRW_04.text(participantCount)}</p>
          <div className="flex flex-col gap-2 min-[641px]:flex-row">
            <Button
              variant="secondary"
              onClick={() => {
                setError(null);
                setConfirming(false);
              }}
              disabled={loading}
            >
              {copy.DRW_04.cancel}
            </Button>
            <Button variant="primary" onClick={handleConfirm} loading={loading}>
              {loading ? copy.DRW_05 : copy.DRW_04.accept}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <Button
            disabled={!canDraw}
            aria-describedby={!canDraw ? "draw-unavailable" : undefined}
            onClick={() => {
              setError(null);
              setChanged(false);
              setConfirming(true);
            }}
          >
            {copy.DRW_02}
          </Button>
          {!canDraw && (
            <p id="draw-unavailable" className="text-sm text-text-muted">
              {copy.DRW_03}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminPanel({
  initialData,
  adminToken,
  action = removeParticipantAction,
  drawAction = runDrawAction,
  onReload = () => window.location.reload(),
}: AdminPanelProps) {
  const [participants, setParticipants] = useState(initialData.participants);
  const [participantCount, setParticipantCount] = useState(initialData.participantCount);
  const [draw, setDraw] = useState<DrawState>(initialData.draw);
  const [justDrew, setJustDrew] = useState(false);
  const [confirmingId, setConfirmingId] = useState<ParticipantId | null>(null);
  const [loadingId, setLoadingId] = useState<ParticipantId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { group, inviteUrl } = initialData;
  const isDrawn = draw.status === "drawn";
  const drawnDate = isDrawn ? new Date(draw.drawnAt).toLocaleDateString("pt-BR") : "";

  async function handleConfirmRemove(participantId: ParticipantId) {
    setLoadingId(participantId);
    setErrorMessage(null);
    try {
      const res = await action(adminToken, participantId);
      if (res.ok && res.participantCount !== undefined) {
        setParticipants((prev) => prev.filter((p) => p.id !== participantId));
        setParticipantCount(res.participantCount);
        setConfirmingId(null);
      } else {
        setErrorMessage(res.message ?? copy.ADM_11);
      }
    } catch {
      setErrorMessage(copy.GLB_08);
    } finally {
      setLoadingId(null);
    }
  }

  const shareDetails = {
    name: group.name,
    maxValueCents: group.maxValueCents,
    exchangeDate: group.exchangeDate,
    location: group.location,
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1.3fr] lg:items-start">
      <header className="grid gap-3 rounded-xl bg-primary-soft p-5 sm:p-7 lg:col-span-2">
        <p className="text-sm font-semibold text-primary-soft-text">{copy.ADM_01}</p>
        <div className="flex min-w-0 flex-col items-start gap-3">
          <h1 className="page-title min-w-0">{group.name}</h1>
          {isDrawn ? (
            <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-success">
              {copy.ADM_03(drawnDate)}
            </span>
          ) : (
            <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-primary-soft-text">
              {copy.ADM_02}
            </span>
          )}
        </div>
      </header>

      <Card title={copy.ADM_04.title} className="lg:col-span-2">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-text-muted">{copy.ADM_04.date}</dt>
            <dd className="font-medium text-text">{formatDateBr(group.exchangeDate)}</dd>
          </div>
          <div>
            <dt className="text-text-muted">{copy.ADM_04.value}</dt>
            <dd className="font-medium text-text">
              {copy.EXTRA.currencyPrefix} {formatBrl(group.maxValueCents)}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">{copy.ADM_04.location}</dt>
            <dd className="font-medium text-text">{group.location ?? copy.ADM_04.missing}</dd>
          </div>
        </dl>
      </Card>

      <Card title={copy.ADM_05.title}>
        <p className="mb-3 text-sm">{copy.ADM_05.text}</p>
        <CopyField label={copy.ADM_05.title} value={inviteUrl} copyLabel={copy.ADM_06.copy}>
          <a
            className={buttonClass("secondary")}
            href={whatsappUrl(buildInviteMessage(shareDetails, inviteUrl))}
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.ADM_06.share}
          </a>
        </CopyField>
      </Card>

      <Card title={copy.ADM_07.count(participantCount)} className="lg:row-span-2">
        {errorMessage && (
          <div
            role="alert"
            className="mb-4 rounded-xl bg-danger-bg p-3 text-sm text-danger border border-danger"
          >
            {errorMessage}
          </div>
        )}
        {participants.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">{copy.ADM_08}</p>
        ) : (
          <ul className="divide-y divide-line">
            {participants.map((p) => (
              <li
                key={p.id}
                className="py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-medium wrap-break-word text-text">{p.displayName}</span>
                  <span className="block text-xs text-text-muted">
                    {copy.ADM_07.joined(new Date(p.joinedAt).toLocaleDateString("pt-BR"))}
                  </span>
                </div>
                {!isDrawn && (
                  <div>
                    {confirmingId === p.id ? (
                      <div className="flex flex-col gap-2 rounded-xl bg-warning-bg p-3 text-xs border border-warning">
                        <p className="font-medium text-warning">
                          {copy.ADM_10.confirm(p.displayName)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => setConfirmingId(null)}
                            disabled={loadingId === p.id}
                          >
                            {copy.ADM_10.cancel}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleConfirmRemove(p.id)}
                            loading={loadingId === p.id}
                          >
                            {copy.ADM_10.accept}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setErrorMessage(null);
                          setConfirmingId(p.id);
                        }}
                        aria-label={copy.ADM_09.label(p.displayName)}
                      >
                        {copy.ADM_09.text}
                      </Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={copy.DRW_01.title}>
        {isDrawn ? (
          <DrawSuccessSection
            drawnDate={drawnDate}
            shareDetails={shareDetails}
            autoFocus={justDrew}
          />
        ) : (
          <DrawOpenSection
            key={participantCount}
            participantCount={participantCount}
            adminToken={adminToken}
            drawAction={drawAction}
            onReload={onReload}
            onDrawn={(drawnAt) => {
              setDraw({ status: "drawn", drawnAt });
              setConfirmingId(null);
              setJustDrew(true);
            }}
          />
        )}
      </Card>
    </div>
  );
}

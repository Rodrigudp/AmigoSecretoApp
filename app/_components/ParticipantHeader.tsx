import { copy } from "../_lib/copy";
import type { ReactNode } from "react";
import { Card } from "@/app/_components/Card";
import { formatBrl, formatDateBr } from "@/app/_lib/whatsapp";

export type ParticipantHeaderProps = {
  groupName: string;
  participantName: string;
  drawStatus: "open" | "drawn";
  exchangeDate: string;
  maxValueCents: number;
  location: string | null;
  actions?: ReactNode;
};

/**
 * Shared header of the participant area (PAR-04) and of the personal-link
 * screen (PAR-03, Front-end). Large text (>= 16 px, RNF10), simple wording for
 * the older audience (persona Seu João).
 */
export function ParticipantHeader({
  groupName,
  participantName,
  drawStatus,
  exchangeDate,
  maxValueCents,
  location,
  actions,
}: ParticipantHeaderProps) {
  return (
    <header className="flex flex-col gap-3 rounded-xl bg-primary-soft p-5 sm:p-7">
      <p className="text-sm font-semibold wrap-break-word text-primary-soft-text">
        {copy.ARE_01.group(groupName)}
      </p>
      <h1 className="page-title">{copy.ARE_01.greeting(participantName)}</h1>
      <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text">
        <div>
          <dt className="font-semibold">{copy.ADM_04.date}</dt>
          <dd>{formatDateBr(exchangeDate)}</dd>
        </div>
        <div>
          <dt className="font-semibold">{copy.ADM_04.value}</dt>
          <dd>
            {copy.EXTRA.currencyPrefix} {formatBrl(maxValueCents)}
          </dd>
        </div>
        {location ? (
          <div className="min-w-0 max-w-full">
            <dt className="font-semibold">{copy.ADM_04.location}</dt>
            <dd className="wrap-break-word">{location}</dd>
          </div>
        ) : null}
      </dl>
      {drawStatus === "open" ? (
        <p className="text-base text-text-muted">{copy.ARE_02}</p>
      ) : (
        <p className="text-base text-text-muted">{copy.ARE_03}</p>
      )}
      {actions ? <div className="mt-2 flex flex-col gap-2">{actions}</div> : null}
    </header>
  );
}

/**
 * Neutral error state (ADR-002/ADR-004): friendly message, no group details.
 */
export function ParticipantNeutralError({ hint }: { hint?: string }) {
  return (
    <Card tone="warning" title={copy.ARE_06.title} heading="h1">
      <p className="text-base">
        {copy.OG_03}
        {hint ? ` ${hint}` : ""}
      </p>
    </Card>
  );
}

export function ParticipantAreaLoading() {
  return (
    <Card as="div">
      <p role="status" className="text-base text-text-muted">
        {copy.GLB_07}
      </p>
    </Card>
  );
}

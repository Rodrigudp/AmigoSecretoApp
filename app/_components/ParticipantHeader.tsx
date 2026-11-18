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
        Grupo {groupName}
      </p>
      <h1 className="page-title">Olá, {participantName}.</h1>
      <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text">
        <div>
          <dt className="font-semibold">Data da troca</dt>
          <dd>{formatDateBr(exchangeDate)}</dd>
        </div>
        <div>
          <dt className="font-semibold">Valor máximo</dt>
          <dd>até R$ {formatBrl(maxValueCents)}</dd>
        </div>
        {location ? (
          <div className="min-w-0 max-w-full">
            <dt className="font-semibold">Local</dt>
            <dd className="wrap-break-word">{location}</dd>
          </div>
        ) : null}
      </dl>
      {drawStatus === "open" ? (
        <p className="text-base text-text-muted">O sorteio ainda não foi realizado.</p>
      ) : (
        <p className="text-base text-text-muted">
          O sorteio já foi realizado. Veja abaixo quem você tirou.
        </p>
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
    <Card tone="warning" title="Link inválido" heading="h1">
      <p className="text-base">
        Este link é inválido ou não está mais disponível.
        {hint ? ` ${hint}` : ""}
      </p>
    </Card>
  );
}

export function ParticipantAreaLoading() {
  return (
    <Card as="div">
      <p role="status" className="text-base text-text-muted">
        Carregando sua área...
      </p>
    </Card>
  );
}

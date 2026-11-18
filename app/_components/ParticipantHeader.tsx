import type { ReactNode } from "react";
import { Card } from "@/app/_components/Card";

export type ParticipantHeaderProps = {
  groupName: string;
  participantName: string;
  drawStatus: "open" | "drawn";
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
  actions,
}: ParticipantHeaderProps) {
  return (
    <header className="flex flex-col gap-2">
      <p className="text-sm text-neutral-600">Grupo {groupName}</p>
      <h1 className="text-2xl font-bold">Olá, {participantName}!</h1>
      {drawStatus === "open" ? (
        <p className="text-base text-neutral-700">O sorteio ainda não foi realizado.</p>
      ) : (
        <p className="text-base text-neutral-700">
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
    <Card tone="warning" title="Link inválido">
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
      <p className="text-base text-neutral-600">Carregando sua área...</p>
    </Card>
  );
}

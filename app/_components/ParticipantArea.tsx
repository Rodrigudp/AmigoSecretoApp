import type { ReactNode } from "react";
import { Card } from "@/app/_components/Card";
import { Button } from "@/app/_components/Button";
import { ParticipantHeader } from "@/app/_components/ParticipantHeader";
import type { ParticipantView } from "@/src/application/ports";

/**
 * Skeleton of the participant area (PAR-04): header, list-of-wishes placeholder
 * (LST-04) and result placeholder (SRT-04). Renders the area only with data
 * belonging to the token owner (RN03); no ads slots are rendered in
 * `/p/[accessToken]?ck=1` fallback (adsAllowed = false, ADR-004).
 */
export function ParticipantArea({
  view,
  adsAllowed,
  children,
}: {
  view: ParticipantView;
  /** ADR-004: false in the cookie fallback; MON-02 gates ad slots on this. */
  adsAllowed: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6" data-ads-allowed={adsAllowed ? "true" : "false"}>
      <ParticipantHeader
        groupName={view.group.name}
        participantName={view.displayName}
        drawStatus={view.group.status}
        exchangeDate={view.group.exchangeDate}
        maxValueCents={view.group.maxValueCents}
        location={view.group.location}
      />
      {view.group.status === "open" ? (
        <Card title="Lista de desejos">
          <p className="text-base">Em breve você poderá montar aqui a sua lista de desejos.</p>
          <Button disabled className="mt-3">
            Adicionar presente — em breve
          </Button>
        </Card>
      ) : (
        <Card title="Meu amigo secreto">
          <p className="text-base">
            Em breve o resultado aparecerá aqui, escondido até você tocar em revelar.
          </p>
        </Card>
      )}
      {children}
    </div>
  );
}

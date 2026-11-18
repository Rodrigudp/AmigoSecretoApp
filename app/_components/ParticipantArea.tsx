import { copy } from "../_lib/copy";
import type { ReactNode } from "react";
import { Card } from "@/app/_components/Card";
import { ParticipantHeader } from "@/app/_components/ParticipantHeader";
import { AdSlot } from "@/app/_components/AdSlot";
import { WishList } from "@/app/_components/WishList";
import type { ParticipantView } from "@/src/application/ports";

/**
 * Skeleton of the participant area (PAR-04): header, secret santa result
 * placeholder (SRT-04), wishlist (LST-04). Renders the area only with data
 * belonging to the token owner (RN03); no ads slots are rendered in
 * `/p/[accessToken]?ck=1` fallback (adsAllowed = false, ADR-004).
 *
 * BUG-SEC: the canonical route (/p/g/[groupId]) passes `groupId` so that
 * WishList uses cookie-based server actions. The token never reaches
 * the client. The fallback route (/p/[accessToken]) passes `accessToken`
 * because it cannot set cookies (adsAllowed = false, no ad slots).
 */
export function ParticipantArea({
  view,
  adsAllowed,
  accessToken,
  groupId,
  children,
}: {
  view: ParticipantView;
  /** ADR-004: false in the cookie fallback; MON-02 gates ad slots on this. */
  adsAllowed: boolean;
  /** Token-based auth for /p/[accessToken] fallback only. */
  accessToken?: string;
  /** Cookie-based auth for the canonical /p/g/[groupId] route. */
  groupId?: string;
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
      {view.group.status === "drawn" ? (
        <Card title={copy.ARE_05.title}>
          <p className="text-base">{copy.ARE_05.text}</p>
        </Card>
      ) : null}
      <WishList
        mode="owner"
        initialItems={view.ownWishItems}
        drawStatus={view.group.status}
        accessToken={accessToken}
        groupId={groupId}
      />
      <AdSlot
        enabled={process.env.ADS_ENABLED === "true"}
        adsAllowed={adsAllowed && !accessToken}
        client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? ""}
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? ""}
      />
      {children}
    </div>
  );
}

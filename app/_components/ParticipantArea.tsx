import type { ReactNode } from "react";
import { ParticipantHeader } from "@/app/_components/ParticipantHeader";
import { AdSlot } from "@/app/_components/AdSlot";
import { RevealCard } from "@/app/_components/RevealCard";
import { WishList } from "@/app/_components/WishList";
import type { ParticipantView } from "@/src/application/ports";

export function ParticipantArea({
  view,
  adsAllowed,
  accessToken,
  groupId,
  children,
}: {
  view: ParticipantView;
  adsAllowed: boolean;
  accessToken?: string;
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
      {view.group.status === "drawn" ? <RevealCard group={view.group} groupId={groupId} /> : null}
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

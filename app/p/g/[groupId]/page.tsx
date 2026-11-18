import { Suspense } from "react";
import { cookies } from "next/headers";
import { Card } from "@/app/_components/Card";
import {
  ParticipantAreaLoading,
  ParticipantNeutralError,
} from "@/app/_components/ParticipantHeader";
import { ParticipantArea } from "@/app/_components/ParticipantArea";
import { cookieNameFor, resolveParticipantByToken } from "@/app/_lib/participant-view-usecase";

export const metadata = {
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ groupId: string }>;
};

/**
 * Canonical participant area authenticated by the per-group cookie
 * `ptk_<groupId>` (ADR-004). Without the cookie it shows a neutral state
 * pointing to the personal link, without revealing any group data.
 */
export default function ParticipantGroupPage({ params }: PageProps) {
  return (
    <main id="conteudo" tabIndex={-1} className="page-shell">
      <Suspense fallback={<ParticipantAreaLoading />}>
        <ParticipantEntry paramsPromise={params} />
      </Suspense>
    </main>
  );
}

async function ParticipantEntry({ paramsPromise }: { paramsPromise: PageProps["params"] }) {
  const [{ groupId }, cookieStore] = await Promise.all([paramsPromise, cookies()]);
  const cookieToken = cookieStore.get(cookieNameFor(groupId))?.value ?? null;

  if (!cookieToken) {
    return (
      <Card tone="warning" title="Link pessoal necessário" heading="h1">
        <p className="text-base">Abra seu link pessoal para ver esta área.</p>
      </Card>
    );
  }

  const resolved = await resolveParticipantByToken(cookieToken);
  if (!resolved.ok || resolved.value.groupId !== groupId) {
    return <ParticipantNeutralError hint="Peça um novo link ao organizador." />;
  }

  return <ParticipantArea view={resolved.value.view} adsAllowed />;
}

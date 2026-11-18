import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  ParticipantAreaLoading,
  ParticipantNeutralError,
} from "@/app/_components/ParticipantHeader";
import { ParticipantArea } from "@/app/_components/ParticipantArea";
import { decideParticipantAccess } from "@/app/_lib/participant-access";
import { cookieNameFor, resolveParticipantByToken } from "@/app/_lib/participant-view-usecase";
import { copy } from "@/app/_lib/copy";

export const metadata = {
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ accessToken: string }>;
  searchParams: Promise<{ ck?: string }>;
};

/**
 * ADR-004 handshake for GET /p/<accessToken>. Dynamic parts (params, search
 * params, cookies) live inside the Suspense boundary (cacheComponents).
 */
export default function ParticipantAccessTokenPage({ params, searchParams }: PageProps) {
  return (
    <main id="conteudo" tabIndex={-1} className="page-shell">
      <Suspense fallback={<ParticipantAreaLoading />}>
        <ParticipantEntry paramsPromise={params} searchParamsPromise={searchParams} />
      </Suspense>
    </main>
  );
}

async function ParticipantEntry({
  paramsPromise,
  searchParamsPromise,
}: {
  paramsPromise: PageProps["params"];
  searchParamsPromise: PageProps["searchParams"];
}) {
  const [{ accessToken }, query, cookieStore] = await Promise.all([
    paramsPromise,
    searchParamsPromise,
    cookies(),
  ]);

  const resolvedResult = await resolveParticipantByToken(accessToken);
  const decision = decideParticipantAccess({
    accessToken,
    ck: query.ck === "1",
    cookieValue: resolvedResult.ok
      ? (cookieStore.get(cookieNameFor(resolvedResult.value.groupId))?.value ?? null)
      : null,
    resolved: resolvedResult.ok ? resolvedResult.value : null,
  });

  switch (decision.kind) {
    case "invalid":
      return <ParticipantNeutralError hint={copy.EXTRA.invalidHint} />;
    case "canonical":
      redirect(`/p/g/${decision.groupId}`);
    case "probe":
      // Pages cannot set cookies; the route handler sets `ptk_<groupId>` and
      // comes back to /p/<accessToken>?ck=1 (ADR-004 step 3).
      redirect(`/api/p/hs/${decision.accessToken}`);
    case "fallback":
      // WebView without cookie support: render here, no ad slots (ADR-004).
      return <ParticipantArea view={decision.access.view} adsAllowed={false} />;
  }
}

import { redirect } from "next/navigation";
import { Card } from "../../_components/Card";
import { JOIN_MESSAGES } from "../../_lib/join-messages";
import { resolvePersonalAccessUseCase } from "../../_lib/participant-stubs";
import { accessTokensEqual } from "../../_lib/access-token";
import { readPersonalCookie, setPersonalCookie } from "../../_lib/personal-cookie";

/** Cookie handshake is request-time (ADR-004 + Cache Components). */
export const instant = false;

type PageProps = {
  params: Promise<{ accessToken: string }>;
  searchParams: Promise<{ ck?: string }>;
};

/**
 * ADR-004 handshake: token in the URL becomes `ptk_<groupId>`, then redirect
 * to the clean URL. Redirect only when the cookie matches this same link.
 */
export default async function PersonalAccessPage({ params, searchParams }: PageProps) {
  const { accessToken: raw } = await params;
  const accessToken = decodeURIComponent(raw);
  const { ck } = await searchParams;

  const resolved = await resolvePersonalAccessUseCase(accessToken);
  if (!resolved.ok) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
        <Card tone="warning" title="Link indisponível">
          <p role="status">{JOIN_MESSAGES.invalidPersonal}</p>
        </Card>
      </main>
    );
  }

  const { groupId, displayName, expiresAt, group } = resolved.value;
  const cookieValue = await readPersonalCookie(groupId);

  if (cookieValue && accessTokensEqual(cookieValue, accessToken)) {
    redirect(`/p/g/${groupId}`);
  }

  if (ck !== "1") {
    await setPersonalCookie({ groupId, accessToken, expiresAt });
    redirect(`/p/${encodeURIComponent(accessToken)}?ck=1`);
  }

  // Cookie blocked (WebView): stay on the token URL with ads off (PAR-04 fills the area).
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-xl font-bold sm:text-2xl">Olá, {displayName}</h1>
        <p className="mt-1 text-text-muted">{group.name}</p>
      </header>
      <Card title="Sua área">
        <p>Lista de desejos e resultado do sorteio entram em breve.</p>
      </Card>
    </main>
  );
}

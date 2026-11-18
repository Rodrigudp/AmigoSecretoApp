import { Card } from "../../../_components/Card";
import { JOIN_MESSAGES } from "../../../_lib/join-messages";
import { resolvePersonalAccessUseCase } from "../../../_lib/participant-stubs";
import { readPersonalCookie } from "../../../_lib/personal-cookie";

/** Cookie-authenticated area is request-time (ADR-004 + Cache Components). */
export const instant = false;

type PageProps = { params: Promise<{ groupId: string }> };

/** Canonical participant area authenticated by `ptk_<groupId>` (ADR-004). */
export default async function ParticipantByCookiePage({ params }: PageProps) {
  const { groupId } = await params;
  const accessToken = await readPersonalCookie(groupId);

  if (!accessToken) {
    return <NeedLink />;
  }

  const resolved = await resolvePersonalAccessUseCase(accessToken);
  if (!resolved.ok || resolved.value.groupId !== groupId) {
    return <NeedLink />;
  }

  const { displayName, group } = resolved.value;

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

function NeedLink() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <Card tone="warning" title="Link pessoal necessário">
        <p role="status">{JOIN_MESSAGES.needPersonalLink}</p>
      </Card>
    </main>
  );
}

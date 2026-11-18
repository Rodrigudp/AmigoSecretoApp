import type { Metadata } from "next";
import { joinGroupAction } from "../../actions";
import { JoinGroupForm } from "../../_components/JoinGroupForm";
import { Card } from "../../_components/Card";
import { JOIN_MESSAGES } from "../../_lib/join-messages";
import { getInviteViewUseCase } from "../../_lib/participant-stubs";
import { readPersonalCookie } from "../../_lib/personal-cookie";
import { invalidInviteMetadata, inviteOpenGraphMetadata } from "../../_lib/token-page-meta";

/** Cookie + invite token are request-time (Cache Components). */
export const instant = false;

type PageProps = { params: Promise<{ inviteToken: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { inviteToken: rawToken } = await params;
  const inviteToken = decodeURIComponent(rawToken);
  // Preview crawlers must not inflate invite_opened (GRP-04 / SEC note).
  const view = await getInviteViewUseCase({ inviteToken, recordOpened: false });
  if (!view.ok) return invalidInviteMetadata();
  return inviteOpenGraphMetadata({
    groupName: view.value.group.name,
    inviteToken,
  });
}

export default async function InvitePage({ params }: PageProps) {
  const { inviteToken: rawToken } = await params;
  const inviteToken = decodeURIComponent(rawToken);

  // Peek without recording so a resume cookie reload still records once below.
  const base = await getInviteViewUseCase({ inviteToken, recordOpened: false });
  if (!base.ok) {
    return <Blocked title="Link indisponível" body={JOIN_MESSAGES.invalidLink} />;
  }

  const resumeAccessToken = await readPersonalCookie(base.value.groupId);
  const view = await getInviteViewUseCase({
    inviteToken,
    resumeAccessToken: resumeAccessToken ?? undefined,
    recordOpened: true,
  });
  if (!view.ok) {
    return <Blocked title="Link indisponível" body={JOIN_MESSAGES.invalidLink} />;
  }

  const { group, isFull, returningParticipant } = view.value;

  if (group.status !== "open") {
    return <Blocked title={group.name} body={JOIN_MESSAGES.groupClosed} />;
  }
  if (isFull) {
    return <Blocked title={group.name} body={JOIN_MESSAGES.groupFull} />;
  }

  return (
    <main id="conteudo" tabIndex={-1} className="page-shell">
      <JoinGroupForm
        inviteToken={inviteToken}
        groupName={group.name}
        resumeName={returningParticipant?.displayName ?? null}
        resumeHref={resumeAccessToken ? `/p/${resumeAccessToken}` : null}
        action={joinGroupAction}
      />
    </main>
  );
}

function Blocked({ title, body }: { title: string; body: string }) {
  return (
    <main id="conteudo" tabIndex={-1} className="page-shell">
      <Card tone="warning" title={title} heading="h1">
        <p role="status">{body}</p>
      </Card>
    </main>
  );
}

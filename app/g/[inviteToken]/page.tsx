import { joinGroupAction } from "../../actions";
import { JoinGroupForm } from "../../_components/JoinGroupForm";
import { Card } from "../../_components/Card";
import { JOIN_MESSAGES } from "../../_lib/join-messages";
import { getInviteViewUseCase } from "../../_lib/participant-stubs";
import { readPersonalCookie } from "../../_lib/personal-cookie";

/** Cookie + invite token are request-time (Cache Components). */
export const instant = false;

type PageProps = { params: Promise<{ inviteToken: string }> };

export default async function InvitePage({ params }: PageProps) {
  const { inviteToken: rawToken } = await params;
  const inviteToken = decodeURIComponent(rawToken);

  const base = await getInviteViewUseCase({ inviteToken });
  if (!base.ok) {
    return <Blocked title="Link indisponível" body={JOIN_MESSAGES.invalidLink} />;
  }

  const resumeAccessToken = await readPersonalCookie(base.value.groupId);
  const view = resumeAccessToken
    ? await getInviteViewUseCase({ inviteToken, resumeAccessToken })
    : base;
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
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
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
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <Card tone="warning" title={title}>
        <p role="status">{body}</p>
      </Card>
    </main>
  );
}

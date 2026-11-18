import { buildAdminMessage, buildInviteMessage, whatsappUrl } from "../_lib/whatsapp";
import type { ShareDetails } from "../_lib/whatsapp";
import { buttonClass } from "./Button";
import { Card } from "./Card";
import { CopyField } from "./CopyField";
import { copy } from "../_lib/copy";

type GroupCreatedProps = { group: ShareDetails; inviteUrl: string; adminUrl: string };

export function GroupCreated({ group, inviteUrl, adminUrl }: GroupCreatedProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <header className="rounded-xl bg-success-bg p-5 sm:p-7">
        <h1 className="page-title">{copy.CRI_01}</h1>
        <p className="mt-2 wrap-break-word text-text-muted">{group.name}</p>
      </header>

      <Card title={copy.CRI_02.title}>
        <p className="mb-3">{copy.CRI_02.text}</p>
        <CopyField label={copy.CRI_02.title} value={inviteUrl} copyLabel={copy.CRI_03.copy}>
          <a
            className={buttonClass("primary")}
            href={whatsappUrl(buildInviteMessage(group, inviteUrl))}
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.CRI_03.share}
          </a>
        </CopyField>
      </Card>

      <Card title={copy.CRI_04.title}>
        <p className="mb-3">{copy.CRI_04.text}</p>
        <a className={buttonClass("secondary")} href={inviteUrl}>
          {copy.CRI_04.action}
        </a>
      </Card>

      <Card tone="warning" title={copy.CRI_05}>
        <p className="mb-3">{copy.CRI_06}</p>
        <CopyField label={copy.CRI_07.label} value={adminUrl} copyLabel={copy.CRI_07.copy}>
          <a
            className={buttonClass("secondary")}
            href={whatsappUrl(buildAdminMessage(adminUrl))}
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.CRI_07.save}
          </a>
          <a className={buttonClass("secondary")} href={adminUrl}>
            {copy.CRI_07.open}
          </a>
        </CopyField>
      </Card>
    </div>
  );
}

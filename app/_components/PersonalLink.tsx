import { copy } from "../_lib/copy";
import { buildPersonalLinkMessage, whatsappUrl } from "../_lib/whatsapp";
import { JOIN_MESSAGES } from "../_lib/join-messages";
import { buttonClass } from "./Button";
import { Card } from "./Card";
import { CopyField } from "./CopyField";

type PersonalLinkProps = {
  displayName: string;
  personalUrl: string;
  groupId: string;
};

export function PersonalLink({ displayName, personalUrl, groupId }: PersonalLinkProps) {
  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-xl bg-success-bg p-5 sm:p-7">
        <h1 className="page-title">{copy.PES_01(displayName)}</h1>
        <p className="mt-2 text-text-muted">{JOIN_MESSAGES.personalHint}</p>
      </header>

      <Card title={copy.PES_03.title}>
        <CopyField label={copy.PES_03.label} value={personalUrl} copyLabel={copy.PES_03.copy}>
          <a
            className={buttonClass("secondary")}
            href={whatsappUrl(buildPersonalLinkMessage(personalUrl))}
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.PES_03.save}
          </a>
        </CopyField>
      </Card>

      <a className={buttonClass("primary")} href={`/p/g/${groupId}`}>
        {copy.PES_03.open}
      </a>
    </div>
  );
}

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
        <h1 className="page-title">Você entrou, {displayName}.</h1>
        <p className="mt-2 text-text-muted">{JOIN_MESSAGES.personalHint}</p>
      </header>

      <Card title="Seu link pessoal">
        <CopyField label="Link pessoal" value={personalUrl} copyLabel="Copiar" />
        <a
          className={buttonClass("secondary", "mt-2")}
          href={whatsappUrl(buildPersonalLinkMessage(personalUrl))}
          target="_blank"
          rel="noopener noreferrer"
        >
          Salvar no WhatsApp
        </a>
      </Card>

      <a className={buttonClass("primary")} href={`/p/g/${groupId}`}>
        Ir para a minha área
      </a>
    </div>
  );
}

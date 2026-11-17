import { buildAdminMessage, buildInviteMessage, whatsappUrl } from "../_lib/whatsapp";
import type { ShareDetails } from "../_lib/whatsapp";
import { buttonClass } from "./Button";
import { Card } from "./Card";
import { CopyField } from "./CopyField";

type GroupCreatedProps = { group: ShareDetails; inviteUrl: string; adminUrl: string };

export function GroupCreated({ group, inviteUrl, adminUrl }: GroupCreatedProps) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-bold sm:text-2xl">✓ Grupo criado com sucesso!</h1>
        <p className="mt-1 text-text-muted">{group.name}</p>
      </header>

      <Card title="Link do convite">
        <p className="mb-3">Envie este link para a galera entrar só com o nome.</p>
        <CopyField label="Link do convite" value={inviteUrl} copyLabel="Copiar convite" />
        <a
          className={buttonClass("primary", "mt-2")}
          href={whatsappUrl(buildInviteMessage(group, inviteUrl))}
          target="_blank"
          rel="noopener noreferrer"
        >
          Compartilhar no WhatsApp
        </a>
      </Card>

      <Card title="Você também vai participar?">
        <p className="mb-3">
          Entre pelo link de convite com o seu nome para participar do sorteio e receber um amigo
          secreto.
        </p>
        <a className={buttonClass("secondary")} href={inviteUrl}>
          Entrar no grupo como participante
        </a>
      </Card>

      <Card tone="warning" title="Atenção: seu link de organizador">
        <p className="mb-3">
          Este é o seu link secreto de organizador. Não compartilhe no grupo do WhatsApp, pois quem
          tiver este link pode alterar participantes e sortear os pares.
        </p>
        <CopyField label="Link de organizador" value={adminUrl} copyLabel="Copiar link admin" />
        <div className="mt-2 flex flex-col gap-3">
          <a
            className={buttonClass("secondary")}
            href={whatsappUrl(buildAdminMessage(adminUrl))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Salvar no meu WhatsApp
          </a>
          <a className={buttonClass("primary")} href={adminUrl}>
            Ir para o painel do organizador
          </a>
        </div>
      </Card>
    </div>
  );
}

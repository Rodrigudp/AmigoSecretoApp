import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState, type ComponentRef } from "react";
import type { TextInput } from "react-native";
import { readAccess, saveAccess } from "../../src/v1/access";
import { api } from "../../src/v1/api";
import type { Invitation, JoinedGroup } from "../../src/v1/contract";
import { PushOffer } from "../../src/v1/push";
import { Action, Body, Card, errorText, Field, formatDate, formatValue, Page } from "../../src/v1/ui";

export default function InvitationRoute() {
  const { inviteToken } = useLocalSearchParams<{ inviteToken: string }>();
  return <Flow key={inviteToken} inviteToken={inviteToken} />;
}

function Flow({ inviteToken }: { inviteToken?: string }) {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [name, setName] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState<JoinedGroup | null>(null);
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!inviteToken) throw new Error("Este convite não está disponível. Peça um novo link ao organizador.");
      const initial = await api.invitation(inviteToken);
      const saved = await readAccess({ groupId: initial.groupId, role: "participant" });
      const view = saved ? await api.invitation(inviteToken, saved) : initial;
      if (active) setInvitation(view);
    })().catch((failure) => { if (active) setError(errorText(failure)); });
    return () => { active = false; };
  }, [inviteToken, retry]);

  const openArea = (groupId: string) => router.replace(`/p/g/${groupId}`);
  async function join() {
    if (!inviteToken || inFlight.current) return;
    if (!name.trim() || /[<>]/.test(name)) { setInvalid(true); input.current?.focus(); return; }
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await api.join(inviteToken, name.trim());
      await saveAccess({ groupId: result.groupId, role: "participant" }, result.accessToken);
      setJoined(result);
    } catch (failure) { setError(errorText(failure)); }
    finally { setBusy(false); inFlight.current = false; }
  }

  if (joined) return <Page title={`Você entrou, ${joined.displayName}!`}>
    <Card><Body>Sua área ficou salva em Meus grupos neste aparelho.</Body>
      <Action label="Ir para a minha área" run={() => openArea(joined.groupId)} />
    </Card>
    <PushOffer credential={joined.accessToken} />
  </Page>;

  const group = invitation?.group;
  return <Page title="Você foi convidado">
    {group && invitation && <>
      <Card accent><Body>{group.name}</Body><Body>Encontro em {formatDate(group.exchangeDate)}</Body>
        <Body>Valor máximo {formatValue(group.maxValueCents)}</Body>
        {group.location && <Body>{group.location}</Body>}
      </Card>
      {invitation.returningParticipant && <Action secondary
        label={`Continuar como ${invitation.returningParticipant.displayName}`} run={() => openArea(invitation.groupId)} />}
      <Card>
        {group.status === "drawn" ? <Body>As entradas deste grupo estão encerradas. Fale com o organizador.</Body>
          : invitation.isFull ? <Body>Este grupo já está completo (100 pessoas). Fale com o organizador.</Body>
          : <>
            <Body>Entre só com o seu nome. Sem cadastro e sem senha.</Body>
            <Field ref={input} label="Como você se chama?" value={name} maxLength={40}
              onChangeText={(value) => { setName(value); setInvalid(false); }}
              error={invalid ? "Informe seu nome para entrar." : undefined} />
            <Action label={busy ? "Entrando…" : "Entrar no grupo"} disabled={busy} run={() => void join()} />
          </>}
      </Card>
    </>}
    {!group && !error && <Body>Carregando…</Body>}
    {error && <Card><Body alert>{error}</Body>
      {!group && <Action secondary label="Tentar de novo" run={() => { setError(""); setRetry(retry + 1); }} />}
    </Card>}
  </Page>;
}

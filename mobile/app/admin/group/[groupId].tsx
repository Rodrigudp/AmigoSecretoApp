import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, Platform, Share } from "react-native";
import { readAccess } from "../../../src/v1/access";
import { api } from "../../../src/v1/api";
import { ApiError } from "../../../src/v1/client";
import type { Admin } from "../../../src/v1/contract";
import { Action, Body, Card, errorText, formatDate, formatValue, Page } from "../../../src/v1/ui";

type Confirmation = { type: "remove"; id: string; name: string } | { type: "draw"; count: number };

export default function AdminGroup() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  return <Flow key={groupId} groupId={groupId} />;
}

function Flow({ groupId }: { groupId?: string }) {
  const [token, setToken] = useState("");
  const [data, setData] = useState<Admin | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [stale, setStale] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const pending = useRef(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setError("");
    setConfirmation(null);
    setToken("");
    setData(null);
    void (async () => {
      const saved = await readAccess({ groupId: groupId ?? "", role: "organizer" });
      if (!saved) throw new Error("Este painel não está disponível. Abra seu link de organizador.");
      const view = await api.admin(saved);
      if (active) { setToken(saved); setData(view); setStale(false); }
    })().catch((failure) => { if (active) setError(errorText(failure)); });
    return () => { active = false; };
  }, [groupId, retry]));

  async function mutate(change: Confirmation) {
    if (!data || !token || pending.current || stale || data.draw.status !== "open") return;
    pending.current = true;
    setBusy(true);
    setConfirmation(null);
    setError("");
    setNotice("");
    try {
      if (change.type === "remove") {
        const { participantCount } = await api.removeParticipant(token, change.id);
        setData({ ...data, participantCount, participants: data.participants.filter(({ id }) => id !== change.id) });
        setNotice(`${change.name} saiu do grupo.`);
      } else {
        await api.draw(token, change.count);
        setData({ ...data, draw: { status: "drawn" } });
        setNotice("Sorteio feito!");
      }
    } catch (failure) {
      setError(errorText(failure));
      if (change.type === "draw" || (failure instanceof ApiError && failure.code === "INVALID_LINK")) setStale(true);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function ask(change: Confirmation) {
    if (Platform.OS === "web") { setConfirmation(change); return; }
    Alert.alert(confirmTitle(change), confirmText(change), [
      { text: "Cancelar", style: "cancel" },
      { text: change.type === "draw" ? "Fazer o sorteio" : "Remover", style: "destructive", onPress: () => void mutate(change) },
    ], { cancelable: true });
  }

  async function copy(url: string) {
    setError("");
    try {
      const ok = await Clipboard.setStringAsync(url);
      if (!ok) throw new Error();
      setNotice("Link copiado.");
    } catch { setError("Não foi possível copiar o link."); }
  }

  async function share(message: string) {
    setError("");
    try { await Share.share({ message }); }
    catch { setError("Não foi possível compartilhar agora."); }
  }

  const drawn = data?.draw.status === "drawn";
  const group = data?.group;
  return <Page title={group?.name ?? "Painel do organizador"}>
    {data && group && <>
      <Card>
        <Body>Painel do organizador</Body><Body>{drawn ? "Sorteio feito" : "Entradas abertas"}</Body>
        <Body>Encontro em {formatDate(group.exchangeDate)}</Body><Body>Valor máximo {formatValue(group.maxValueCents)}</Body>
        {group.location && <Body>Local do encontro: {group.location}</Body>}
      </Card>
      <Card>
        <Body>Link do convite</Body>
        {drawn ? <Body>As entradas estão encerradas.</Body> : <>
          <Action label="Compartilhar convite" run={() => void share(data.inviteUrl)} />
          <Action secondary label="Copiar link" run={() => void copy(data.inviteUrl)} />
        </>}
      </Card>
      <Card>
        <Body>Participantes ({data.participantCount} de 100)</Body>
        {!data.participants.length && <Body>Ainda não há participantes no grupo.</Body>}
        {data.participants.map((participant) => <Card key={participant.id}>
          <Body>{participant.displayName}</Body><Body>Entrou em {formatDate(participant.joinedAt.slice(0, 10))}</Body>
          {!drawn && !stale && <Action secondary disabled={busy} label={`Remover ${participant.displayName}`}
            run={() => ask({ type: "remove", id: participant.id, name: participant.displayName })} />}
        </Card>)}
      </Card>
      <Card>
        <Body>Sorteio</Body>
        {drawn ? <>
          <Body>Cada pessoa pode abrir o próprio link para ver quem tirou.</Body>
          <Action label="Avisar o grupo" run={() => void share("O sorteio do Papelzinho foi feito! Abra seu link pessoal para ver quem você tirou.")} />
        </> : <>
          {data.participantCount < 3 && <Body>Para sortear, precisa de pelo menos 3 pessoas.</Body>}
          <Action label={busy ? "Aguarde…" : "Fazer o sorteio"} disabled={busy || stale || data.participantCount < 3}
            run={() => ask({ type: "draw", count: data.participantCount })} />
        </>}
      </Card>
    </>}
    {!data && !error && <Body>Carregando…</Body>}
    {confirmation && <Card><Body alert>{confirmTitle(confirmation)}</Body><Body>{confirmText(confirmation)}</Body>
      <Action secondary label="Cancelar" run={() => setConfirmation(null)} />
      <Action label={confirmation.type === "draw" ? "Confirmar sorteio" : "Confirmar remoção"}
        disabled={busy} run={() => void mutate(confirmation)} />
    </Card>}
    {notice && <Body alert>{notice}</Body>}
    {error && <Card><Body alert>{error}</Body>
      {(!data || stale) && <Action secondary label="Atualizar grupo" run={() => setRetry(retry + 1)} />}
    </Card>}
  </Page>;
}

function confirmTitle(change: Confirmation) {
  return change.type === "remove" ? `Remover ${change.name}?` : "Fazer o sorteio?";
}

function confirmText(change: Confirmation) {
  return change.type === "remove" ? "Essa pessoa perderá o acesso a este grupo." :
    `O sorteio será feito com ${change.count} pessoas. As entradas serão encerradas e não será possível desfazer.`;
}

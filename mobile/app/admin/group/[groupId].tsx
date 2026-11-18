import * as Clipboard from "expo-clipboard";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, Platform, Share, View } from "react-native";
import { readAccess } from "../../../src/v1/access";
import { api } from "../../../src/v1/api";
import { drawMessage, invitationMessage } from "../../../src/v1/share-copy";
import { ApiError } from "../../../src/v1/client";
import type { Admin } from "../../../src/v1/contract";
import { Action, Body, Card, errorText, focusTarget, formatDate, formatValue, Page, type FocusTarget } from "../../../src/v1/ui";

type Confirmation = { type: "remove"; id: string; name: string } | { type: "draw"; count: number };

export default function AdminGroup() {
  const { groupId, created } = useLocalSearchParams<{ groupId: string; created?: string }>();
  return <Flow key={groupId} groupId={groupId} created={created === "1"} />;
}

function Flow({ groupId, created }: { groupId?: string; created: boolean }) {
  const [token, setToken] = useState("");
  const [data, setData] = useState<Admin | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [stale, setStale] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const pending = useRef(false);
  const [drawnAt, setDrawnAt] = useState("");
  const dialogTitle = useRef<FocusTarget>(null);
  const listTitle = useRef<FocusTarget>(null);
  const drawTrigger = useRef<FocusTarget>(null);
  const removeTriggers = useRef(new Map<string, FocusTarget>());
  const focusLater = (target: () => FocusTarget | null | undefined) =>
    requestAnimationFrame(() => focusTarget(target()));
  const restore = (change: Confirmation) => focusLater(() => change.type === "draw"
    ? drawTrigger.current : removeTriggers.current.get(change.id));

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
        const next = data.participants[data.participants.findIndex(({ id }) => id === change.id) + 1];
        focusLater(() => next ? removeTriggers.current.get(next.id) : listTitle.current);
      } else {
        const result = await api.draw(token, change.count);
        setDrawnAt(result.drawnAt);
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
    if (Platform.OS === "web") { setConfirmation(change); focusLater(() => dialogTitle.current); return; }
    Alert.alert(confirmTitle(change), confirmText(change), [
      { text: "Cancelar", style: "cancel", onPress: () => restore(change) },
      { text: change.type === "draw" ? "Sim, fazer o sorteio" : "Sim, remover", style: "destructive", onPress: () => void mutate(change) },
    ], { cancelable: true, onDismiss: () => restore(change) });
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

  function openInvitation(url: string) {
    try {
      const inviteToken = new URL(url).pathname.match(/^\/g\/([\w-]+)$/)?.[1];
      if (!inviteToken) throw new Error();
      router.push({ pathname: "/g/[inviteToken]", params: { inviteToken } });
    } catch {
      setError("Não foi possível abrir o convite.");
    }
  }

  const drawn = data?.draw.status === "drawn";
  const group = data?.group;
  return <Page title={group?.name ?? "Painel do organizador"}>
    {data && group && <>
      <Card>
        <Body>Painel do organizador</Body><Body>{drawn ? "Sorteio feito" : "Entradas abertas"}</Body>
        <Body>Encontro em {formatDate(group.exchangeDate)}</Body><Body>Valor máximo {formatValue(group.maxValueCents)}</Body>
        {!!group.location && <Body>Local do encontro: {group.location}</Body>}
      </Card>
      <Card>
        <Body>Link do convite</Body>
        {drawn ? <Body>As entradas estão encerradas.</Body> : <>
          {created && <>
            <Body alert>Grupo criado</Body>
            <Body>Envie o convite para quem vai participar.</Body>
          </>}
          <Action label="Compartilhar convite" run={() => void share(invitationMessage(group, data.inviteUrl))} />
          <Action secondary label="Copiar link" run={() => void copy(data.inviteUrl)} />
          {created && <>
            <Body>Entre pelo convite com o seu nome para entrar no sorteio.</Body>
            <Action secondary label="Entrar no grupo" run={() => openInvitation(data.inviteUrl)} />
          </>}
        </>}
      </Card>
      <Card>
        <View ref={listTitle} accessible tabIndex={-1}><Body>Participantes ({data.participantCount} de 100)</Body></View>
        {!data.participants.length && <Body>Ninguém entrou ainda. Envie o convite acima.</Body>}
        {data.participants.map((participant) => <Card key={participant.id}>
          <Body>{participant.displayName}</Body><Body>Entrou em {formatDate(participant.joinedAt.slice(0, 10))}</Body>
          {!drawn && !stale && <Action secondary controlRef={(node) => {
            if (node) removeTriggers.current.set(participant.id, node);
            else removeTriggers.current.delete(participant.id);
          }} disabled={busy} label={`Remover ${participant.displayName}`}
            run={() => ask({ type: "remove", id: participant.id, name: participant.displayName })} />}
        </Card>)}
      </Card>
      <Card>
        <Body>Sorteio</Body>
        {drawn ? <>
          {!!drawnAt && <Body>Sorteio feito em {new Date(drawnAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}.</Body>}
          <Body>Cada pessoa já pode ver quem tirou pelo seu link pessoal. Por segurança, este painel não mostra os pares.</Body>
          <Body>Você também participa? Abra o seu link pessoal para ver quem você tirou.</Body>
          <Action label="Avisar o grupo" run={() => void share(drawMessage(group))} />
        </> : <>
          {data.participantCount < 3 && <Body>Para sortear, precisa de pelo menos 3 pessoas.</Body>}
          <Action controlRef={drawTrigger} label={busy ? "Sorteando…" : "Fazer o sorteio"} disabled={busy || stale || data.participantCount < 3}
            run={() => ask({ type: "draw", count: data.participantCount })} />
        </>}
      </Card>
    </>}
    {!data && !error && <Body>Carregando…</Body>}
    {confirmation && <Card><View ref={dialogTitle} tabIndex={-1} accessible accessibilityRole="header"><Body>{confirmTitle(confirmation)}</Body></View><Body>{confirmText(confirmation)}</Body>
      <Action secondary label="Cancelar" run={() => { setConfirmation(null); restore(confirmation); }} />
      <Action label={confirmation.type === "draw" ? "Sim, fazer o sorteio" : "Sim, remover"}
        disabled={busy} run={() => void mutate(confirmation)} />
    </Card>}
    {!!notice && <Body alert>{notice}</Body>}
    {!!error && <Card><Body alert>{error}</Body>
      {(!data || stale) && <Action secondary label="Atualizar grupo" run={() => setRetry(retry + 1)} />}
    </Card>}
  </Page>;
}

function confirmTitle(change: Confirmation) {
  return change.type === "remove" ? `Remover ${change.name}?` : "Fazer o sorteio agora?";
}

function confirmText(change: Confirmation) {
  return change.type === "remove" ? "Essa pessoa não entrará no sorteio." :
    `${change.count} pessoas vão participar. Depois do sorteio, ninguém mais entra pelo convite e não dá para desfazer.`;
}

import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState, type ComponentRef } from "react";
import { AccessibilityInfo, AppState, Platform, View } from "react-native";
import { api } from "./api";
import { ApiError } from "./client";
import type { GroupDetails, Reveal, Status } from "./contract";
import { Action, Body, Card, errorText, formatDate, formatValue } from "./ui";
import { OpenWishLink } from "./wish-list";

export function RevealCard({ credential, group }: { credential: string; group: GroupDetails & { status: Status } }) {
  const [result, setResult] = useState<Reveal | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const version = useRef(0);
  const pending = useRef(false);
  const foreground = useRef(false);
  const recipient = useRef<ComponentRef<typeof View>>(null);
  const trigger = useRef<ComponentRef<typeof View>>(null);

  const focus = (element: ComponentRef<typeof View> | null) => {
    if (!element) return;
    if (Platform.OS === "web") element.focus();
    else AccessibilityInfo.sendAccessibilityEvent(element, "focus");
  };

  const close = useCallback(() => {
    version.current++;
    pending.current = false;
    setError("");
    setResult(null);
    setBusy(false);
  }, []);

  useFocusEffect(useCallback(() => {
    foreground.current = AppState.currentState === "active" || AppState.currentState === null;
    const listener = AppState.addEventListener("change", (state) => {
      foreground.current = state === "active";
      if (!foreground.current) close();
    });
    return () => {
      foreground.current = false;
      close();
      listener.remove();
    };
  }, [close, credential]));

  async function reveal() {
    if (pending.current || !foreground.current) return;
    const request = ++version.current;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await api.reveal(credential);
      if (request !== version.current || !foreground.current) return;
      setResult(response);
      requestAnimationFrame(() => focus(recipient.current));
    } catch (failure) {
      if (request !== version.current) return;
      setError(failure instanceof ApiError && failure.code === "INVALID_LINK"
        ? "Seu acesso a este grupo não está mais disponível." : errorText(failure));
    } finally {
      if (request === version.current) {
        pending.current = false;
        setBusy(false);
      }
    }
  }

  return <Card accent={group.status === "drawn" && !result}>
    <Body>Seu amigo secreto</Body>
    {group.status !== "drawn" ? <Body>O sorteio ainda não foi realizado.</Body> : result ? <>
      <View ref={recipient} accessible tabIndex={-1} accessibilityLabel={`Você tirou ${result.recipientName}`}>
        <Body>Você tirou</Body><Body>{result.recipientName}</Body>
      </View>
      <Body>Encontro em {formatDate(group.exchangeDate)}</Body>
      <Body>Valor máximo {formatValue(group.maxValueCents)}</Body>
      {group.location && <Body>Local: {group.location}</Body>}
      <Body>Guarde segredo até o encontro.</Body>
      <Action secondary label="Esconder" run={() => {
        close();
        requestAnimationFrame(() => focus(trigger.current));
      }} />
      <Body>Lista de desejos de {result.recipientName}</Body>
      {!result.wishItems.length && <Body>Ainda não há presentes na lista.</Body>}
      {result.wishItems.map((item) => <Card key={item.id}><Body>{item.title}</Body>
        {item.note && <Body>{item.note}</Body>}<OpenWishLink item={item} onError={setError} /></Card>)}
    </> : <>
      <View ref={trigger} accessible tabIndex={-1} accessibilityLabel="Seu amigo secreto">
        <Action label={busy ? "Revelando…" : "Revelar meu amigo secreto"} disabled={busy} run={() => void reveal()} />
      </View>
      {error && <Action secondary label="Tentar de novo" disabled={busy} run={() => void reveal()} />}
    </>}
    {error && <Body alert>{error}</Body>}
  </Card>;
}

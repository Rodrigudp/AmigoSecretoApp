import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState, type ComponentRef } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";
import { api } from "./api";
import { ApiError } from "./client";
import type { GroupDetails, Reveal, Status } from "./contract";
import { Action, Body, Card, focusTarget, formatDate, formatValue } from "./ui";
import { fonts, palette } from "../theme";
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
      requestAnimationFrame(() => focusTarget(recipient.current));
    } catch (failure) {
      if (request !== version.current) return;
      setError(failure instanceof ApiError && failure.code === "INVALID_LINK"
        ? "Seu acesso a este grupo não está mais disponível." : "Não foi possível carregar o seu resultado. Tente de novo.");
    } finally {
      if (request === version.current) {
        pending.current = false;
        setBusy(false);
      }
    }
  }

  if (group.status !== "drawn") return <Card>
    <Body>Seu amigo secreto</Body>
    <Body>Quando o organizador fizer o sorteio, o seu amigo secreto aparece aqui.</Body>
  </Card>;

  if (result) return <>
    <Card>
      <Body>Seu amigo secreto</Body>
      <View ref={recipient} accessible tabIndex={-1} accessibilityLabel={`Você tirou ${result.recipientName}`}>
        <Body>Você tirou</Body>
        <Text style={styles.recipient}>{result.recipientName}</Text>
      </View>
      <Body>Encontro em {formatDate(group.exchangeDate)}</Body>
      <Body>Valor máximo {formatValue(group.maxValueCents)}</Body>
      {group.location && <Body>Local: {group.location}</Body>}
      <Body>Guarde segredo até o encontro.</Body>
      <Action secondary label="Esconder" run={() => {
        close();
        requestAnimationFrame(() => focusTarget(trigger.current));
      }} />
    </Card>
    <Card>
      <Body>Lista de desejos de {result.recipientName}</Body>
      {!result.wishItems.length && <Body>Ainda não há presentes na lista.</Body>}
      {result.wishItems.map((item) => <Card key={item.id}><Body>{item.title}</Body>
        {item.note && <Body>{item.note}</Body>}<OpenWishLink item={item} onError={setError} /></Card>)}
      {error && <Body alert>{error}</Body>}
    </Card>
  </>;

  if (error) return <Card>
    <Body alert>{error}</Body>
    <Action secondary label={busy ? "Revelando…" : "Tentar de novo"} disabled={busy} run={() => void reveal()} />
  </Card>;

  return <Card accent>
    <Body>Seu amigo secreto</Body>
    <Body>O sorteio foi feito. Toque para ver quem você tirou. Confira se ninguém está olhando a sua tela.</Body>
    <Action controlRef={trigger} label={busy ? "Revelando…" : "Revelar meu amigo secreto"} disabled={busy} run={() => void reveal()} />
  </Card>;
}

const styles = StyleSheet.create({
  recipient: { color: palette.text, fontFamily: fonts.strong, fontSize: 24, lineHeight: 32 },
});

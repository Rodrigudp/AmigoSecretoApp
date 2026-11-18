import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { readAccess } from "../../../src/v1/access";
import { api } from "../../../src/v1/api";
import { ApiError } from "../../../src/v1/client";
import type { Participant } from "../../../src/v1/contract";
import { Action, Body, Card, errorText, formatDate, Page } from "../../../src/v1/ui";
import { cachedWishes, forgetWishes, syncWishes, type WishCache } from "../../../src/v1/wish-cache";
import { WishList } from "../../../src/v1/wish-list";

export default function ParticipantGroup() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [credential, setCredential] = useState("");
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [cache, setCache] = useState<WishCache | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    void (async () => {
      const token = await readAccess({ groupId: groupId ?? "", role: "participant" });
      if (!token) throw new Error("Este grupo não está disponível neste aparelho. Abra seu link pessoal ou peça ajuda ao organizador.");
      try {
        const details = await api.participant(token);
        if (active) { setParticipant(details); setCredential(token); }
        const list = await syncWishes(token, details.view.ownWishItems);
        if (active) setCache(list);
      } catch (failure) {
        if (failure instanceof ApiError && failure.code === "INVALID_LINK") await forgetWishes(token);
        else if (failure instanceof ApiError && failure.code === "OFFLINE") {
          const saved = await cachedWishes(token);
          if (active && saved) { setCredential(token); setCache(saved); }
        }
        throw failure;
      }
    })().catch((failure) => { if (active) setError(errorText(failure)); });
    return () => { active = false; };
  }, [groupId, retry]);

  const view = participant?.view;
  return <Page title={view?.group.name ?? "Área do participante"}>
    {view && <Card><Body>Olá, {view.displayName}.</Body><Body>Encontro em {formatDate(view.group.exchangeDate)}</Body></Card>}
    {error && <Card><Body alert>{cache ? "Sem conexão. Você está vendo a lista salva neste aparelho." : error}</Body>
      <Action secondary label="Tentar de novo" run={() => { setError(""); setRetry(retry + 1); }} /></Card>}
    {cache && credential ? <WishList key={groupId} credential={credential} cache={cache} onCache={setCache}/>
      : !error && <Body>Carregando…</Body>}
  </Page>;
}

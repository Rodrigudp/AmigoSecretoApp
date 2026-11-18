import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { listAccess, readAccess } from "../src/v1/access";
import { api, useDemo } from "../src/v1/api";
import { ApiError } from "../src/v1/client";
import type { Summary } from "../src/v1/contract";
import { Action, Body, Card, formatDate, Page } from "../src/v1/ui";

export default function Home() {
  const [groups, setGroups] = useState<Summary[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setError(false);
    void (async () => {
      const accesses = await listAccess();
      const results = await Promise.allSettled(accesses.map(async (access) => {
        const token = await readAccess(access);
        return token ? api.summary(token) : null;
      }));
      if (!active) return;
      setGroups(results.flatMap((result) => result.status === "fulfilled" && result.value ? [result.value] : []));
      setUnavailable(results.some((result) => result.status === "rejected" &&
        result.reason instanceof ApiError && result.reason.code === "INVALID_LINK"));
      setError(results.some((result) => result.status === "rejected" &&
        (!(result.reason instanceof ApiError) || result.reason.code !== "INVALID_LINK")));
    })().catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [retry]));

  return (
    <Page title="Meus grupos" home>
      <Action label="Criar grupo" run={() => router.push("/create")} />
      {error && <Card><Body alert>Sem conexão no momento. Verifique a internet e tente de novo.</Body>
        <Action secondary label="Tentar de novo" run={() => setRetry(retry + 1)} /></Card>}
      {unavailable && <Body alert>Este grupo não está disponível neste aparelho. Abra seu link pessoal ou peça ajuda ao organizador.</Body>}
      {!groups && !error && <Body>Carregando…</Body>}
      {groups?.length === 0 && !error && !unavailable && <Card><Body>Você ainda não tem grupos neste aparelho. Crie um grupo ou abra um convite que recebeu.</Body></Card>}
      {groups?.map((group) => (
        <Card key={`${group.groupId}:${group.role}`}>
          <Body>{group.groupName}</Body>
          <Body>{group.role === "organizer" ? "Organizador" : "Participante"} · {group.status === "drawn" ? "Sorteio feito" : "Entradas abertas"}</Body>
          <Body>Encontro em {formatDate(group.exchangeDate)}</Body>
          <Action secondary label={group.role === "organizer" ? "Abrir o painel" : "Ir para a minha área"}
            run={() => router.push(group.role === "organizer" ? `/admin/group/${group.groupId}` : `/p/g/${group.groupId}`)} />
        </Card>
      ))}
      {useDemo && <Action secondary label="Abrir convite de demonstração" run={() => router.push("/g/demo-invite")} />}
    </Page>
  );
}

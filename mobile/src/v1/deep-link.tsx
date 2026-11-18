import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { acceptAccess } from "./access";
import type { Role } from "./contract";
import { Body, errorText, Page } from "./ui";

export function DeepLink({ role }: { role: Role }) {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!token) return;
    void acceptAccess(role, token).then(({ groupId }) => {
      if (active) router.replace(role === "participant" ? `/p/g/${groupId}` : `/admin/group/${groupId}`);
    }).catch((failure) => { if (active) setError(errorText(failure)); });
    return () => { active = false; };
  }, [role, token]);
  return <Page title={role === "participant" ? "Área do participante" : "Painel do organizador"}>
    <Body alert={!!error}>{error || "Carregando…"}</Body>
  </Page>;
}

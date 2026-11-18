import Constants from "expo-constants";
import { AndroidImportance } from "expo-notifications";
import * as Notifications from "expo-notifications";
import { useState } from "react";
import { Platform } from "react-native";
import { api, useDemo } from "./api";
import { Action, Body, Card, errorText } from "./ui";

export function PushOffer({ credential }: { credential: string }) {
  const [closed, setClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const platform = Platform.OS;

  if (closed || (platform !== "android" && platform !== "ios" && !useDemo)) return null;

  async function enable() {
    if (useDemo) { setClosed(true); return; }
    if (platform !== "android" && platform !== "ios") return;
    setError("");
    setBusy(true);
    try {
      const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
      if (typeof projectId !== "string") throw new Error("Os avisos ainda não estão disponíveis neste app.");
      if (platform === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Avisos do Papelzinho", importance: AndroidImportance.DEFAULT,
        });
      }
      const permission = await Notifications.requestPermissionsAsync();
      if (permission.granted) {
        const result = await Notifications.getExpoPushTokenAsync({ projectId });
        await api.registerPush(credential, { expoPushToken: result.data, platform });
      }
      setClosed(true);
    } catch (failure) {
      setError(failure instanceof Error && failure.message.startsWith("Os avisos")
        ? errorText(failure) : "Não foi possível ativar os avisos. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  return <Card>
    <Body>Quer receber avisos?</Body>
    <Body>Podemos avisar quando o sorteio sair e lembrar você do encontro.</Body>
    {error && <Body alert>{error}</Body>}
    <Action label={busy ? "Ativando…" : "Ativar avisos"} disabled={busy} run={() => void enable()} />
    <Action secondary label="Agora não" disabled={busy} run={() => setClosed(true)} />
  </Card>;
}

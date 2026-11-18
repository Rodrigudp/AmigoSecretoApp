import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";
import { api, useDemo } from "./api";
import { clearReceipt, makeReceiptKey, readReceipt, saveReceipt } from "./push-receipt";
import { revokePush } from "./push-registration";
import { Action, Body, Card } from "./ui";
import { requestDeviceToken } from "./push-device";

export function PushOffer({ credential, manage = false }: { credential: string; manage?: boolean }) {
  const [closed, setClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ key: string; token: string } | null>(null);
  const inFlight = useRef(false);
  const platform = Platform.OS;
  const supported = useDemo || platform === "android" || platform === "ios";

  useFocusEffect(useCallback(() => {
    if (!supported) return;
    let active = true;
    void (async () => {
      const key = await makeReceiptKey(credential);
      const token = await readReceipt(key);
      if (active) setReceipt(token ? { key, token } : null);
    })().catch(() => { if (active) setError("Não foi possível consultar os avisos. Tente de novo."); });
    return () => { active = false; };
  }, [credential, supported]));

  async function withPending(operation: () => Promise<void>, message: string) {
    if (inFlight.current) return;
    inFlight.current = true;
    setError("");
    setBusy(true);
    try { await operation(); }
    catch { setError(message); }
    finally { inFlight.current = false; setBusy(false); }
  }

  function enable() {
    void withPending(async () => {
      if (!useDemo && platform !== "android" && platform !== "ios") return;
      const devicePlatform = platform === "android" ? "android" : "ios";
      const token = useDemo ? "ExpoPushToken[demo]" : await requestDeviceToken(devicePlatform);
      if (!token) { setClosed(true); return; }
      const key = await makeReceiptKey(credential);
      await saveReceipt(key, token);
      try {
        await api.registerPush(credential, { expoPushToken: token, platform: devicePlatform });
      } catch {
        // A response can be lost after registration. Keep the revocation handle in SecureStore.
        setReceipt({ key, token });
        throw new Error("Push registration could not be confirmed");
      }
      setReceipt({ key, token });
    }, "Não foi possível confirmar a ativação dos avisos. Você pode desativar ou tentar de novo.");
  }

  function disable() {
    if (!receipt) return;
    const { key, token } = receipt;
    void withPending(async () => {
      await revokePush(api, credential, token, () => clearReceipt(key));
      setReceipt(null);
      setClosed(false);
    }, "Não foi possível desativar os avisos. Tente de novo.");
  }

  if (!supported || closed || (manage && !receipt && !error)) return null;
  return <Card>
    {receipt ? <>
      {error && <Body alert>{error}</Body>}
      <Action secondary label={busy ? "Aguarde…" : "Desativar avisos"} disabled={busy} run={disable} />
      {error && !manage && <Action label="Tentar ativar de novo" disabled={busy} run={enable} />}
    </> : <>
      <Body>Quer receber avisos?</Body>
      <Body>Podemos avisar quando o sorteio sair e lembrar você do encontro.</Body>
      {error && <Body alert>{error}</Body>}
      <Action label={busy ? "Ativando…" : "Ativar avisos"} disabled={busy} run={enable} />
      <Action secondary label="Agora não" disabled={busy} run={() => setClosed(true)} />
    </>}
  </Card>;
}

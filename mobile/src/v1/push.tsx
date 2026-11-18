import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { api, useDemo } from "./api";
import { clearReceipt, makeReceiptKey, readReceipt, saveReceipt } from "./push-receipt";
import { revokePush } from "./push-registration";
import { Action, Body, Card, focusTarget, type FocusTarget } from "./ui";
import { requestDeviceToken } from "./push-device";

const copy = {
  disable: "Desativar avisos", // APP-25
  disabled: "Avisos deste grupo desativados neste aparelho.", // APP-26
  disableError: "Não foi possível desativar os avisos. Tente de novo.", // APP-27
  statusError: "Não foi possível consultar os avisos. Tente de novo.", // APP-28
  enableError: "Não foi possível confirmar a ativação dos avisos. Você pode desativar ou tentar de novo.", // APP-29
  retry: "Tentar ativar de novo", // APP-30
} as const;

export function PushOffer({ credential, manage = false }: { credential: string; manage?: boolean }) {
  const [closed, setClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ key: string; token: string } | null>(null);
  const inFlight = useRef(false);
  const [notice, setNotice] = useState(false);
  const confirmation = useRef<FocusTarget>(null);
  const platform = Platform.OS;
  const supported = useDemo || platform === "android" || platform === "ios";

  useFocusEffect(useCallback(() => {
    if (!supported) return;
    let active = true;
    void (async () => {
      const key = await makeReceiptKey(credential);
      const token = await readReceipt(key);
      if (active) setReceipt(token ? { key, token } : null);
    })().catch(() => { if (active) setError(copy.statusError); });
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
    }, copy.enableError);
  }

  function disable() {
    if (!receipt) return;
    const { key, token } = receipt;
    void withPending(async () => {
      await revokePush(api, credential, token, () => clearReceipt(key));
      setReceipt(null);
      setNotice(true);
      requestAnimationFrame(() => focusTarget(confirmation.current));
    }, copy.disableError);
  }

  if (notice) return <Card>
    <View ref={confirmation} accessible tabIndex={-1} accessibilityRole="alert"
      accessibilityLiveRegion="polite" accessibilityLabel={copy.disabled}>
      <Body>{copy.disabled}</Body>
    </View>
  </Card>;

  if (!supported || closed || (manage && !receipt && !error)) return null;
  return <Card>
    {receipt ? <>
      {!!error && <Body alert>{error}</Body>}
      <Action secondary label={busy ? "Aguarde…" : copy.disable} disabled={busy} run={disable} />
      {!!error && !manage && <Action label={copy.retry} disabled={busy} run={enable} />}
    </> : <>
      <Body>Quer receber avisos?</Body>
      <Body>Podemos avisar quando o sorteio sair e lembrar você do encontro.</Body>
      {!!error && <Body alert>{error}</Body>}
      <Action label={busy ? "Ativando…" : "Ativar avisos"} disabled={busy} run={enable} />
      <Action secondary label="Agora não" disabled={busy} run={() => setClosed(true)} />
    </>}
  </Card>;
}

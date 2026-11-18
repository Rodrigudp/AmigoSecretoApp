import { randomUUID } from "expo-crypto";
import * as Network from "expo-network";
import { useEffect, useRef, useState, type ComponentRef } from "react";
import { Linking, View, type TextInput } from "react-native";
import { ApiError } from "./client";
import type { Wish, WishDraft } from "./contract";
import { Action, Body, Card, errorText, Field, focusTarget, type FocusTarget } from "./ui";
import { cachedWishes, queueWish, syncWishes, visibleWishes, type WishCache } from "./wish-cache";

const empty = { title: "", url: "", note: "" };

function httpsUrl(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" && !!url.hostname && !url.username && !url.password; }
  catch { return false; }
}

export function OpenWishLink({ item, onError }: { item: Wish; onError: (message: string) => void }) {
  const url = item.url;
  if (!url || !httpsUrl(url)) return null;
  return <Action secondary label={`Ver ${item.title} na loja`} run={() => void Linking.openURL(url)
    .catch(() => onError("Não foi possível abrir o link da loja."))} />;
}

export function WishList({ credential, cache, onCache }: {
  credential: string; cache: WishCache; onCache: (cache: WishCache) => void;
}) {
  const [draft, setDraft] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [urlError, setUrlError] = useState(false);
  const busyRef = useRef(false);
  const controls = useRef(new Map<string, FocusTarget>());
  // Ref callbacks run after commit. The callback factory itself does not read the map.
  const control = (key: string) => (node: FocusTarget | null) => {
    // eslint-disable-next-line react-hooks/refs
    if (node) controls.current.set(key, node);
    else controls.current.delete(key);
  };
  const focus = (key: string) => requestAnimationFrame(() => focusTarget(controls.current.get(key)));
  const titleField = useRef<ComponentRef<typeof TextInput>>(null);
  const urlField = useRef<ComponentRef<typeof TextInput>>(null);
  const items = visibleWishes(cache);
  const pendingIds = new Set(cache.pending.map(({ id }) => id));

  async function sync() {
    const result = await syncWishes(credential);
    onCache(result);
    return result;
  }

  async function perform(operation: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try { await operation(); }
    catch (failure) {
      if (failure instanceof ApiError && failure.code === "OFFLINE") {
        const latest = await cachedWishes(credential);
        if (latest) onCache(latest);
        setNotice("Alteração salva neste aparelho. Vamos enviar quando a conexão voltar.");
      } else { setError(errorText(failure)); }
    } finally { busyRef.current = false; setBusy(false); }
  }

  useEffect(() => {
    if (!cache.pending.length) return;
    const listener = Network.addNetworkStateListener((state) => {
      if (state.isInternetReachable) void perform(async () => { await sync(); setNotice("Alterações sincronizadas."); });
    });
    return () => listener.remove();
  });

  function open(item?: Wish) {
    setTitleError(false);
    setUrlError(false);
    setEditing(item?.id ?? "new");
    setDraft(item ? { title: item.title, url: item.url ?? "", note: item.note ?? "" } : empty);
    requestAnimationFrame(() => titleField.current?.focus());
  }

  function save() {
    const title = draft.title.trim();
    const url = draft.url.trim();
    if (!title) { setTitleError(true); titleField.current?.focus(); return; }
    if (url && !httpsUrl(url)) { setUrlError(true); urlField.current?.focus(); return; }
    const input: WishDraft = { title, url: url || null, note: draft.note.trim() || null };
    const id = editing;
    if (!id) return;
    void perform(async () => {
      const change = id === "new"
        ? { kind: "add" as const, id: randomUUID(), draft: input, existingIds: cache.items.map((item) => item.id) }
        : { kind: "update" as const, id, draft: input };
      onCache(await queueWish(credential, cache, change));
      setEditing(null);
      try {
        const synced = await sync();
        const saved = id === "new"
          ? synced.items.find((item) => !cache.items.some((prior) => prior.id === item.id) && item.title === input.title)
          : synced.items.find((item) => item.id === id);
        if (saved) focus(`title:${saved.id}`);
        setNotice("Presente salvo.");
      } catch (failure) {
        focus(`title:${change.id}`);
        throw failure;
      }
    });
  }

  function remove(id: string) {
    void perform(async () => {
      onCache(await queueWish(credential, cache, { kind: "remove", id }));
      setConfirm(null);
      const index = items.findIndex((item) => item.id === id);
      const neighbor = items[index + 1] ?? items[index - 1];
      try { await sync(); }
      finally { focus(neighbor ? `title:${neighbor.id}` : "add"); }
      setNotice("Presente apagado.");
    });
  }

  return <Card>
    <Body>Lista de desejos</Body>
    <Body>{items.length} de 20 presentes</Body>
    {!items.length && <Body>Sua lista está vazia. Adicione ideias de presente para quem tirar você.</Body>}
    {items.map((item) => <Card key={item.id}>
      <View ref={control(`title:${item.id}`)} accessible accessibilityLabel={item.title} tabIndex={-1}><Body>{item.title}</Body></View>
      {!!item.note && <Body>{item.note}</Body>}
      <OpenWishLink item={item} onError={setError} />
      {confirm === item.id ? <>
        <Body>Apagar “{item.title}”? Não dá para desfazer.</Body>
        <Action controlRef={control("cancel-remove")} secondary label="Cancelar" run={() => { setConfirm(null); focus(`remove:${item.id}`); }} />
        <Action label="Sim, apagar" disabled={busy} run={() => remove(item.id)} />
      </> : <>
        <Action controlRef={control(`edit:${item.id}`)} secondary label={`Editar ${item.title}`} disabled={busy || pendingIds.has(item.id)} run={() => open(item)} />
        <Action controlRef={control(`remove:${item.id}`)} secondary label={`Apagar ${item.title}`} disabled={busy || pendingIds.has(item.id)} run={() => { setConfirm(item.id); focus("cancel-remove"); }} />
      </>}
    </Card>)}
    {editing ? <Card>
      <Body>{editing === "new" ? "Novo presente" : "Editar presente"}</Body>
      <Field ref={titleField} label="Nome do presente" value={draft.title} maxLength={80}
        error={titleError ? "Escreva o nome do presente." : undefined}
        onChangeText={(title) => { setTitleError(false); setDraft({ ...draft, title }); }} />
      <Field ref={urlField} label="Link da loja (opcional)" value={draft.url} maxLength={2048}
        keyboardType="url" autoCapitalize="none" error={urlError ? "Use um link que comece com https://." : undefined}
        onBlur={() => setUrlError(!!draft.url.trim() && !httpsUrl(draft.url.trim()))}
        onChangeText={(url) => { setUrlError(false); setDraft({ ...draft, url }); }} />
      <Field label="Observação (opcional)" value={draft.note} maxLength={200}
        multiline onChangeText={(note) => setDraft({ ...draft, note })} />
      <Action label={busy ? "Salvando…" : editing === "new" ? "Salvar presente" : "Salvar alterações"} disabled={busy} run={save} />
      <Action secondary label="Cancelar" disabled={busy} run={() => { setEditing(null); focus(editing === "new" ? "add" : `edit:${editing}`); }} />
    </Card> : <Action controlRef={control("add")} label="Adicionar presente" disabled={items.length >= 20 || busy} run={() => open()} />}
    {items.length >= 20 && <Body>Você chegou a 20 presentes. Apague um para adicionar outro.</Body>}
    {!!notice && <Body alert>{notice}</Body>}
    {!!error && <Body alert>{error}</Body>}
    {!!cache.pending.length && <Action secondary label="Tentar de novo" disabled={busy} run={() =>
      void perform(async () => { await sync(); setNotice("Alterações sincronizadas."); })} />}
  </Card>;
}

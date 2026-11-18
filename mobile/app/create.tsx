import * as Clipboard from "expo-clipboard";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import { useRef, useState, type ComponentRef } from "react";
import { Share, type TextInput } from "react-native";
import { acceptAccess } from "../src/v1/access";
import type { GroupDetails } from "../src/v1/contract";
import { DatePicker } from "../src/v1/date-picker";
import { invitationMessage } from "../src/v1/share-copy";
import { api } from "../src/v1/api";
import { Action, Body, Card, errorText, Field, Page } from "../src/v1/ui";

function normalizeDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const iso = `${match[3]}-${match[2]}-${match[1]}`;
  const parsed = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(+parsed) || parsed.toISOString().slice(0, 10) !== iso) return null;
  const today = new Intl.DateTimeFormat("fr-CA", { timeZone: "America/Sao_Paulo", dateStyle: "short" }).format();
  return iso > today ? iso : null;
}

export default function Create() {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [created, setCreated] = useState<{ groupId: string; inviteToken: string; inviteUrl: string; group: GroupDetails } | null>(null);
  const inFlight = useRef(false);
  const request = useRef<{ data: string; id: string }>(null);
  const nameField = useRef<ComponentRef<typeof TextInput>>(null);
  const valueField = useRef<ComponentRef<typeof TextInput>>(null);
  const dateField = useRef<ComponentRef<typeof TextInput>>(null);
  const exchangeDate = normalizeDate(date);
  const maxValueCents = /^\d{1,8}(?:,\d{1,2})?$/.test(value.trim()) ? Math.round(Number(value.replace(",", ".")) * 100) : 0;
  const validName = name.trim() && !/[<>]/.test(name);

  async function submit() {
    if (inFlight.current) return;
    setSubmitted(true);
    if (!validName) return nameField.current?.focus();
    if (!maxValueCents) return valueField.current?.focus();
    if (!exchangeDate) return dateField.current?.focus();
    inFlight.current = true;
    setPending(true);
    setError("");
    const input = { name: name.trim(), maxValueCents, exchangeDate, location: location.trim() || null };
    const data = JSON.stringify(input);
    if (request.current?.data !== data) request.current = { data, id: Crypto.randomUUID() };
    try {
      const result = await api.create({ ...input, requestId: request.current.id });
      const access = await acceptAccess("organizer", result.adminToken);
      setCreated({ groupId: access.groupId, inviteUrl: result.inviteUrl, inviteToken: result.inviteToken, group: input });
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setPending(false);
      inFlight.current = false;
    }
  }

  if (created) return (
    <Page title="Grupo criado">
      <Card>
        <Body>Envie o convite para quem vai participar.</Body>
        <Action label="Compartilhar convite" run={() => void Share.share({ message: invitationMessage(created.group, created.inviteUrl) }).catch(() => setNotice("Não foi possível compartilhar o convite."))} />
        <Action secondary label="Copiar link" run={() => void Clipboard.setStringAsync(created.inviteUrl).then((ok) => setNotice(ok ? "Link copiado." : "Não foi possível copiar o link.")).catch(() => setNotice("Não foi possível copiar o link."))} />
        {notice && <Body alert>{notice}</Body>}
        <Action secondary label="Abrir o painel" run={() => router.replace(`/admin/group/${created.groupId}`)} />
      </Card>
      <Card><Body>Entre pelo convite com o seu nome para entrar no sorteio.</Body>
        <Action secondary label="Entrar no grupo" run={() => router.push({ pathname: "/g/[inviteToken]", params: { inviteToken: created.inviteToken } })} />
      </Card>
    </Page>
  );

  return (
    <Page title="Criar grupo">
      <Card>
        <Body>Os dados abaixo vão no convite.</Body>
        <Field ref={nameField} label="Nome do grupo" value={name} onChangeText={setName} maxLength={60}
          error={submitted && !validName ? "Informe o nome do grupo." : undefined} />
        <Field ref={valueField} label="Valor máximo do presente (R$)" value={value} onChangeText={setValue}
          keyboardType="decimal-pad" error={submitted && !maxValueCents ? "Informe um valor maior que zero." : undefined} />
        <Field ref={dateField} label="Data do encontro" value={date} onChangeText={setDate} placeholder="dd/mm/yyyy"
          maxLength={10} error={submitted && !exchangeDate ? "Informe uma data futura no formato dd/mm/yyyy." : undefined} />
        <Body>Formato: dd/mm/yyyy</Body>
        <DatePicker value={date} onChange={setDate} />
        <Field label="Local do encontro (opcional)" value={location} onChangeText={setLocation} maxLength={120} />
        {error && <Body alert>{error}</Body>}
        <Action label={pending ? "Criando…" : "Criar grupo"} disabled={pending} run={() => void submit()} />
      </Card>
    </Page>
  );
}

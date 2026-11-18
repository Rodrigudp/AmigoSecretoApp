"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { CreateGroupActionResult } from "../actions";
import { validateCreateGroup, parseMoneyToCents } from "../_lib/create-group-schema";
import type { FieldErrors } from "../_lib/create-group-schema";
import { clearRequestId, getRequestId } from "../_lib/request-id";
import { formatBrl } from "../_lib/whatsapp";
import type { ShareDetails } from "../_lib/whatsapp";
import { Button } from "./Button";
import { Card } from "./Card";
import { GroupCreated } from "./GroupCreated";
import { Input } from "./Input";

type Props = {
  action: (input: {
    name: string;
    maxValue: string;
    exchangeDate: string;
    location: string;
    requestId: string;
  }) => Promise<CreateGroupActionResult>;
};

type Created = { group: ShareDetails; inviteUrl: string; adminUrl: string };

const EMPTY = { name: "", maxValue: "", exchangeDate: "", location: "" };

export function CreateGroupForm({ action }: Props) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);

  const set = (field: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  function formatMoneyOnBlur() {
    const cents = parseMoneyToCents(values.maxValue);
    if (cents !== null && cents > 0) setValues((v) => ({ ...v, maxValue: formatBrl(cents) }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    const input = { ...values, requestId: getRequestId() };
    const local = validateCreateGroup(input);
    if (!local.ok) return showErrors(local.errors);

    setLoading(true);
    setMessage(null);
    try {
      const result = await action(input);
      if (result.ok) {
        clearRequestId();
        setCreated({ group: local.data, inviteUrl: result.inviteUrl, adminUrl: result.adminUrl });
      } else {
        showErrors(result.errors ?? {}, result.message);
      }
    } catch {
      setMessage("Sem conexão no momento. Verifique a internet e tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  function showErrors(fieldErrors: FieldErrors, summary?: string) {
    setErrors(fieldErrors);
    setMessage(
      Object.keys(fieldErrors).length ? "Confira os campos destacados." : (summary ?? null)
    );
  }

  if (created) return <GroupCreated {...created} />;

  return (
    <div className="grid gap-9 lg:grid-cols-[1.12fr_1fr] lg:items-start lg:gap-14 xl:gap-20">
      <div className="flex min-w-0 flex-col gap-6 lg:pt-4">
        <header className="flex flex-col gap-4">
          <h1 className="text-[clamp(2.125rem,5.8vw,4.375rem)] leading-[1.08] font-bold tracking-[-0.06em]">
            <span className="inline-block rounded-xl bg-peach px-2 pb-1">Amigo secreto</span>{" "}
            <span className="mt-1 block">começa aqui.</span>
          </h1>
          <p className="max-w-md font-accent text-xl leading-snug text-text-muted sm:text-2xl">
            Organize a troca em dois minutos. Cada pessoa entra pelo convite, só com o nome.
          </p>
        </header>
        <ol
          aria-label="Como funciona"
          className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium lg:mt-2"
        >
          {["Crie o grupo", "Envie o convite", "Faça o sorteio"].map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-note font-semibold">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
      <form
        onSubmit={onSubmit}
        noValidate
        aria-labelledby="create-group-title"
        className="paper-panel flex min-w-0 flex-col gap-4"
      >
        <div className="border-b border-line pb-4">
          <h2 id="create-group-title" className="text-2xl font-bold tracking-tight">
            Criar grupo
          </h2>
          <p className="mt-1 text-sm text-text-muted">Os dados abaixo vão no convite.</p>
        </div>
        {message ? (
          <Card tone="danger" title="Não foi possível criar o grupo">
            <p role="alert">{message}</p>
          </Card>
        ) : null}
        <Input
          label="Nome do grupo"
          required
          maxLength={60}
          placeholder="Ex.: Família Silva"
          value={values.name}
          onChange={set("name")}
          error={errors.name}
        />
        <Input
          label="Valor máximo do presente (R$)"
          required
          inputMode="decimal"
          placeholder="Ex.: 50,00"
          value={values.maxValue}
          onChange={set("maxValue")}
          onBlur={formatMoneyOnBlur}
          error={errors.maxValue}
        />
        <Input
          label="Data da troca de presentes"
          required
          type="date"
          value={values.exchangeDate}
          onChange={set("exchangeDate")}
          error={errors.exchangeDate}
        />
        <Input
          label="Local da troca (opcional)"
          maxLength={120}
          placeholder="Ex.: Casa da Vó Maria"
          value={values.location}
          onChange={set("location")}
          error={errors.location}
        />
        <Button type="submit" loading={loading} className="mt-2 self-start">
          {loading ? "Criando…" : "Criar grupo"}
          {loading ? null : <span aria-hidden="true">→</span>}
        </Button>
      </form>
    </div>
  );
}

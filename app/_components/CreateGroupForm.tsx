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
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-lg font-semibold">🎁 Amigo Secreto</p>
        <h1 className="mt-2 text-xl font-bold sm:text-2xl">Faça seu amigo secreto em 2 minutos.</h1>
        <p className="mt-1 text-text-muted">Sem cadastro e sem senha.</p>
      </header>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {message ? (
          <Card tone="danger" title="Não foi possível criar o grupo">
            <p role="alert">{message}</p>
          </Card>
        ) : null}
        <Input
          label="Nome do grupo"
          required
          maxLength={60}
          placeholder="Ex.: Família Silva, Turma da Firma"
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
          placeholder="Ex.: Casa da Vó Maria às 20h"
          value={values.location}
          onChange={set("location")}
          error={errors.location}
        />
        <Button type="submit" loading={loading}>
          {loading ? "Criando…" : "Criar grupo de amigo secreto"}
        </Button>
      </form>
    </div>
  );
}

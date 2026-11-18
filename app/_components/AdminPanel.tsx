"use client";

import { useState } from "react";
import type { AdminGroup, ParticipantId } from "@/src/application/ports";
import { removeParticipantAction } from "../admin-actions";
import { buildInviteMessage, formatBrl, formatDateBr, whatsappUrl } from "../_lib/whatsapp";
import { Button, buttonClass } from "./Button";
import { Card } from "./Card";
import { CopyField } from "./CopyField";

type AdminPanelProps = {
  initialData: AdminGroup;
  adminToken: string;
  action?: (
    adminToken: string,
    participantId: ParticipantId
  ) => Promise<{ ok: boolean; participantCount?: number; message?: string }>;
};

export function AdminPanel({
  initialData,
  adminToken,
  action = removeParticipantAction,
}: AdminPanelProps) {
  const [participants, setParticipants] = useState(initialData.participants);
  const [participantCount, setParticipantCount] = useState(initialData.participantCount);
  const [confirmingId, setConfirmingId] = useState<ParticipantId | null>(null);
  const [loadingId, setLoadingId] = useState<ParticipantId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { group, inviteUrl, draw } = initialData;
  const isDrawn = draw.status === "drawn";

  async function handleConfirmRemove(participantId: ParticipantId) {
    setLoadingId(participantId);
    setErrorMessage(null);
    try {
      const res = await action(adminToken, participantId);
      if (res.ok && res.participantCount !== undefined) {
        setParticipants((prev) => prev.filter((p) => p.id !== participantId));
        setParticipantCount(res.participantCount);
        setConfirmingId(null);
      } else {
        setErrorMessage(res.message ?? "Não foi possível remover o participante.");
      }
    } catch {
      setErrorMessage("Erro de comunicação ao remover participante. Tente novamente.");
    } finally {
      setLoadingId(null);
    }
  }

  const shareDetails = {
    name: group.name,
    maxValueCents: group.maxValueCents,
    exchangeDate: group.exchangeDate,
    location: group.location,
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1.3fr] lg:items-start">
      <header className="grid gap-3 rounded-xl bg-primary-soft p-5 sm:p-7 lg:col-span-2">
        <p className="text-sm font-semibold text-primary-soft-text">Painel do organizador</p>
        <div className="flex min-w-0 flex-col items-start gap-3">
          <h1 className="page-title min-w-0">{group.name}</h1>
          {isDrawn ? (
            <span className="rounded-full bg-success-bg px-3 py-1 text-xs font-semibold text-success">
              Sorteio Realizado em {new Date(draw.drawnAt).toLocaleDateString("pt-BR")}
            </span>
          ) : (
            <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-primary-soft-text">
              Aberto para inscrições
            </span>
          )}
        </div>
      </header>

      <Card title="Detalhes do grupo" className="lg:col-span-2">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-text-muted">Data da troca</dt>
            <dd className="font-medium text-text">{formatDateBr(group.exchangeDate)}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Valor sugerido</dt>
            <dd className="font-medium text-text">até R$ {formatBrl(group.maxValueCents)}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Local</dt>
            <dd className="font-medium text-text">{group.location ?? "Não informado"}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Link do convite">
        <p className="mb-3 text-sm">Compartilhe o convite com os amigos que vão participar:</p>
        <CopyField label="Link do convite" value={inviteUrl} copyLabel="Copiar convite">
          <a
            className={buttonClass("secondary")}
            href={whatsappUrl(buildInviteMessage(shareDetails, inviteUrl))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Compartilhar no WhatsApp
          </a>
        </CopyField>
      </Card>

      <Card title={`Participantes (${participantCount} de 100)`} className="lg:row-span-2">
        {errorMessage && (
          <div
            role="alert"
            className="mb-4 rounded-xl bg-danger-bg p-3 text-sm text-danger border border-danger"
          >
            {errorMessage}
          </div>
        )}
        {participants.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">
            Nenhum participante entrou ainda. Compartilhe o link de convite acima!
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {participants.map((p) => (
              <li
                key={p.id}
                className="py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-medium wrap-break-word text-text">{p.displayName}</span>
                  <span className="block text-xs text-text-muted">
                    Entrou em {new Date(p.joinedAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {!isDrawn && (
                  <div>
                    {confirmingId === p.id ? (
                      <div className="flex flex-col gap-2 rounded-xl bg-warning-bg p-3 text-xs border border-warning">
                        <p className="font-medium text-warning">
                          Tem certeza que deseja remover {p.displayName}? Essa pessoa não
                          participará do sorteio.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => setConfirmingId(null)}
                            disabled={loadingId === p.id}
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleConfirmRemove(p.id)}
                            loading={loadingId === p.id}
                          >
                            Confirmar remoção
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setErrorMessage(null);
                          setConfirmingId(p.id);
                        }}
                        aria-label={`Remover ${p.displayName}`}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Sorteio">
        {isDrawn ? (
          <div className="text-sm text-text">
            <p className="font-medium text-success">✓ Sorteio realizado!</p>
            <p className="text-text-muted mt-1">
              Os participantes já podem conferir seus amigos secretos acessando seus links pessoais.
              Por segurança, os pares nunca são enviados para este painel.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-text-muted">
              Quando todos tiverem entrado, dispare o sorteio para definir quem tira quem.
            </p>
            <div className="flex flex-col items-start gap-2">
              <Button disabled aria-describedby="draw-unavailable">
                Realizar Sorteio
              </Button>
              <p id="draw-unavailable" className="text-sm text-text-muted">
                Em breve
              </p>
              {participantCount < 3 ? (
                <p className="text-xs text-text-muted">
                  São necessários pelo menos 3 participantes para sortear.
                </p>
              ) : null}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

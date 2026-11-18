"use client";

import { useRef, useState } from "react";
import { copy } from "../_lib/copy";
import type { FormEvent } from "react";
import type { JoinGroupActionResult } from "../actions";
import { JOIN_MESSAGES } from "../_lib/join-messages";
import { validateJoinGroup } from "../_lib/join-group-schema";
import type { JoinFieldErrors } from "../_lib/join-group-schema";
import { buttonClass, Button } from "./Button";
import { Card } from "./Card";
import { Input } from "./Input";
import { PersonalLink } from "./PersonalLink";

type Props = {
  inviteToken: string;
  groupName: string;
  resumeName: string | null;
  resumeHref: string | null;
  action: (input: { inviteToken: string; displayName: string }) => Promise<JoinGroupActionResult>;
};

type Joined = { displayName: string; personalUrl: string; groupId: string };

export function JoinGroupForm({ inviteToken, groupName, resumeName, resumeHref, action }: Props) {
  const [showForm, setShowForm] = useState(!resumeName);
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<JoinFieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState<Joined | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  function showFailure(result: Extract<JoinGroupActionResult, { ok: false }>) {
    setErrors(result.errors ?? {});
    if (result.errors?.displayName) {
      setMessage(copy.CNV_06);
      nameRef.current?.focus();
    } else setMessage(result.message ?? JOIN_MESSAGES.generic);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    const local = validateJoinGroup({ inviteToken, displayName });
    if (!local.ok) {
      setErrors(local.errors);
      setMessage(copy.CNV_06);
      nameRef.current?.focus();
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const result = await action({ inviteToken, displayName: local.data.displayName });
      if (result.ok) {
        setJoined(result);
      } else {
        showFailure(result);
      }
    } catch {
      setMessage(copy.GLB_08);
    } finally {
      setLoading(false);
    }
  }

  if (joined) return <PersonalLink {...joined} />;

  if (resumeName && resumeHref && !showForm) {
    return (
      <div className="flex flex-col gap-6">
        <InviteHeader groupName={groupName} />
        <div className="paper-panel flex flex-wrap gap-3">
          <a className={buttonClass("primary")} href={resumeHref}>
            {JOIN_MESSAGES.continueAs(resumeName)}
          </a>
          <button type="button" className={buttonClass("ghost")} onClick={() => setShowForm(true)}>
            {JOIN_MESSAGES.enterOther}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <InviteHeader groupName={groupName} />
      <form onSubmit={onSubmit} noValidate className="paper-panel flex flex-col gap-4">
        {message ? (
          message === copy.CNV_06 ? (
            <div role="alert">
              <Card tone="danger" title={message} />
            </div>
          ) : (
            <Card tone="danger" title={copy.EXTRA.joinErrorTitle}>
              <p role="alert">{message}</p>
            </Card>
          )
        ) : null}
        <Input
          ref={nameRef}
          label={copy.CNV_03.label}
          required
          maxLength={40}
          autoComplete="nickname"
          placeholder={copy.CNV_03.placeholder}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
        />
        <Button type="submit" loading={loading} className="self-start">
          {loading ? copy.CNV_04.loading : copy.CNV_04.action}
        </Button>
      </form>
    </div>
  );
}

function InviteHeader({ groupName }: { groupName: string }) {
  return (
    <header className="grid gap-3 rounded-xl bg-note p-5 sm:p-7">
      <p className="text-sm font-semibold">{copy.CNV_01}</p>
      <h1 className="page-title">{groupName}</h1>
      <p className="font-accent text-lg">{copy.CNV_02}</p>
    </header>
  );
}

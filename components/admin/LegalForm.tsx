"use client";

import { useState } from "react";
import { saveLegalAction } from "@/app/admin/actions";
import { Field, Input, Textarea } from "@/components/ui/Form";
import type { LegalPage } from "@/lib/cms-types";

export function LegalForm({
  kind,
  initial,
}: {
  kind: "privacy" | "terms";
  initial: LegalPage;
}) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="grid max-w-[720px] gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSaving(true);
        void saveLegalAction(kind, form).then(() => {
          setSaving(false);
          setSaved(true);
        });
      }}
    >
      <Field label="Title">
        <Input
          value={form.title}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, title: event.target.value }))
          }
          required
        />
      </Field>
      <Field label="Description">
        <Textarea
          rows={3}
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
        />
      </Field>
      <Field label="Last updated">
        <Input
          value={form.lastUpdated}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, lastUpdated: event.target.value }))
          }
        />
      </Field>
      <Field label="Content">
        <Textarea
          rows={16}
          value={form.content}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, content: event.target.value }))
          }
          required
        />
      </Field>
      <button
        type="submit"
        disabled={saving}
        className="bg-amber font-display text-bg mt-2 w-fit rounded-[3px] px-6 py-[13px] text-[14px] font-semibold disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save page"}
      </button>
      {saved ? (
        <p className="text-steel font-mono text-[13px]">Page saved.</p>
      ) : null}
    </form>
  );
}

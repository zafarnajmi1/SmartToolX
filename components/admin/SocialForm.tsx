"use client";

import { useState } from "react";
import { saveSocialAction } from "@/app/admin/actions";
import { Field, Input } from "@/components/ui/Form";
import type { SocialLinks } from "@/lib/cms-types";

const labels: Record<keyof SocialLinks, string> = {
  facebook: "Facebook",
  twitter: "X / Twitter",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  github: "GitHub",
  threads: "Threads",
  discord: "Discord",
};

export function SocialForm({ initial }: { initial: SocialLinks }) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="grid max-w-[640px] gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSaving(true);
        void saveSocialAction(form).then(() => {
          setSaving(false);
          setSaved(true);
        });
      }}
    >
      {(Object.keys(labels) as (keyof SocialLinks)[]).map((key) => (
        <Field key={key} label={labels[key]}>
          <Input
            type="url"
            value={form[key]}
            placeholder="https://"
            onChange={(event) => {
              setForm((prev) => ({ ...prev, [key]: event.target.value }));
              setSaved(false);
            }}
          />
        </Field>
      ))}
      <button
        type="submit"
        disabled={saving}
        className="bg-amber font-display text-bg mt-2 w-fit rounded-[3px] px-6 py-[13px] text-[14px] font-semibold disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save social links"}
      </button>
      {saved ? (
        <p className="text-steel font-mono text-[13px]">Social links saved.</p>
      ) : null}
    </form>
  );
}

"use client";

import { useState } from "react";
import { saveSeoAction } from "@/app/admin/actions";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import type { SeoEntry } from "@/lib/cms-types";

export function SeoForm({
  pages,
}: {
  pages: SeoEntry[];
}) {
  const [selected, setSelected] = useState(pages[0]?.path ?? "/");
  const current = pages.find((page) => page.path === selected) ?? pages[0];
  const [form, setForm] = useState<SeoEntry>(current);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function load(path: string) {
    const next = pages.find((page) => page.path === path);
    if (!next) return;
    setSelected(path);
    setForm(next);
    setSaved(false);
  }

  function update<K extends keyof SeoEntry>(key: K, value: SeoEntry[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  return (
    <form
      className="grid max-w-[820px] gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSaving(true);
        void saveSeoAction(form).then(() => {
          setSaving(false);
          setSaved(true);
        });
      }}
    >
      <Field label="Page">
        <Select
          value={selected}
          onChange={(event) => load(event.target.value)}
        >
          {pages.map((page) => (
            <option key={page.path} value={page.path}>
              {page.name} ({page.path})
            </option>
          ))}
        </Select>
      </Field>

      <div className="text-amber font-mono text-[11px] tracking-[0.08em] uppercase">
        Meta tags
      </div>
      <Field label="Meta title">
        <Input
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          required
        />
      </Field>
      <Field label="Meta description">
        <Textarea
          rows={3}
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          required
        />
      </Field>
      <Field label="Keywords">
        <Input
          value={form.keywords}
          onChange={(event) => update("keywords", event.target.value)}
        />
      </Field>
      <Field label="Canonical URL">
        <Input
          value={form.canonical}
          onChange={(event) => update("canonical", event.target.value)}
        />
      </Field>
      <Field label="H1">
        <Input
          value={form.h1}
          onChange={(event) => update("h1", event.target.value)}
        />
      </Field>
      <Field label="Focus keyword">
        <Input
          value={form.focusKeyword}
          onChange={(event) => update("focusKeyword", event.target.value)}
        />
      </Field>
      <Field label="Author">
        <Input
          value={form.author}
          onChange={(event) => update("author", event.target.value)}
        />
      </Field>
      <Field label="Language">
        <Input
          value={form.language}
          onChange={(event) => update("language", event.target.value)}
        />
      </Field>
      <Field label="Schema type">
        <Input
          value={form.schemaType}
          onChange={(event) => update("schemaType", event.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-text-dim flex items-center gap-2 font-mono text-[12px]">
          <input
            type="checkbox"
            checked={form.robotsIndex}
            onChange={(event) => update("robotsIndex", event.target.checked)}
          />
          Robots index
        </label>
        <label className="text-text-dim flex items-center gap-2 font-mono text-[12px]">
          <input
            type="checkbox"
            checked={form.robotsFollow}
            onChange={(event) => update("robotsFollow", event.target.checked)}
          />
          Robots follow
        </label>
      </div>

      <div className="text-amber mt-4 font-mono text-[11px] tracking-[0.08em] uppercase">
        Open Graph
      </div>
      <Field label="OG title">
        <Input
          value={form.ogTitle}
          onChange={(event) => update("ogTitle", event.target.value)}
        />
      </Field>
      <Field label="OG description">
        <Textarea
          rows={3}
          value={form.ogDescription}
          onChange={(event) => update("ogDescription", event.target.value)}
        />
      </Field>
      <Field label="OG type">
        <Input
          value={form.ogType}
          onChange={(event) => update("ogType", event.target.value)}
        />
      </Field>
      <Field label="OG image URL">
        <Input
          value={form.ogImage}
          onChange={(event) => update("ogImage", event.target.value)}
        />
      </Field>
      <Field label="OG image alt">
        <Input
          value={form.ogImageAlt}
          onChange={(event) => update("ogImageAlt", event.target.value)}
        />
      </Field>
      <Field label="OG locale">
        <Input
          value={form.ogLocale}
          onChange={(event) => update("ogLocale", event.target.value)}
        />
      </Field>
      <Field label="OG site name">
        <Input
          value={form.ogSiteName}
          onChange={(event) => update("ogSiteName", event.target.value)}
        />
      </Field>

      <div className="text-amber mt-4 font-mono text-[11px] tracking-[0.08em] uppercase">
        Twitter / X
      </div>
      <Field label="Twitter card">
        <Select
          value={form.twitterCard}
          onChange={(event) =>
            update(
              "twitterCard",
              event.target.value as SeoEntry["twitterCard"],
            )
          }
        >
          <option value="summary">summary</option>
          <option value="summary_large_image">summary_large_image</option>
        </Select>
      </Field>
      <Field label="Twitter title">
        <Input
          value={form.twitterTitle}
          onChange={(event) => update("twitterTitle", event.target.value)}
        />
      </Field>
      <Field label="Twitter description">
        <Textarea
          rows={3}
          value={form.twitterDescription}
          onChange={(event) => update("twitterDescription", event.target.value)}
        />
      </Field>
      <Field label="Twitter image URL">
        <Input
          value={form.twitterImage}
          onChange={(event) => update("twitterImage", event.target.value)}
        />
      </Field>
      <Field label="Twitter site">
        <Input
          value={form.twitterSite}
          onChange={(event) => update("twitterSite", event.target.value)}
        />
      </Field>
      <Field label="Twitter creator">
        <Input
          value={form.twitterCreator}
          onChange={(event) => update("twitterCreator", event.target.value)}
        />
      </Field>

      <button
        type="submit"
        disabled={saving}
        className="bg-amber font-display text-bg mt-2 w-fit rounded-[3px] px-6 py-[13px] text-[14px] font-semibold disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save SEO"}
      </button>
      {saved ? (
        <p className="text-steel font-mono text-[13px]">SEO saved for {form.path}.</p>
      ) : null}
    </form>
  );
}

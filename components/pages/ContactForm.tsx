"use client";

import { useState } from "react";
import { Field, Input, Textarea } from "@/components/ui/Form";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="border-line bg-surface max-w-[560px] rounded-[8px] border p-[26px]"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-4">
        <Field label="Name">
          <Input name="name" required placeholder="Your name" />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Message">
          <Textarea
            name="message"
            required
            rows={5}
            placeholder="How can we help?"
          />
        </Field>
        <button
          type="submit"
          className="bg-amber font-display text-bg w-fit rounded-[3px] px-6 py-[13px] text-[14px] font-semibold"
        >
          Send message
        </button>
        {sent ? (
          <p className="text-steel font-mono text-[13px]">
            Thanks. We will get back to you shortly.
          </p>
        ) : null}
      </div>
    </form>
  );
}

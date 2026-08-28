"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { Field, Input } from "@/components/ui/Form";
import { Logo } from "@/components/layout/Logo";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form
      action={action}
      className="border-line bg-surface w-full max-w-[420px] rounded-[8px] border p-[26px]"
    >
      <div className="mb-8">
        <Logo />
        <h1 className="font-display mt-6 text-[22px] font-semibold">
          Admin login
        </h1>
        <p className="text-text-dim mt-2 text-[13px] leading-[1.5]">
          Sign in to manage SEO, social links, and legal pages.
        </p>
      </div>
      <div className="grid gap-4">
        <Field label="Email">
          <Input
            name="email"
            type="email"
            autoComplete="username"
            required
            placeholder="admin@gmail.com"
          />
        </Field>
        <Field label="Password">
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
        </Field>
        {state?.error ? (
          <p className="font-mono text-[13px] text-red-400">{state.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="bg-amber font-display text-bg mt-2 w-full rounded-[3px] px-6 py-[13px] text-[14px] font-semibold disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}

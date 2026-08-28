"use client";

import { useEffect, useState } from "react";

type RatesResponse = {
  rates: Record<string, number> | null;
  updated: string | null;
};

export function useExchangeRates() {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/rates", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as RatesResponse;
        if (cancelled || !data.rates) return;
        setRates(data.rates);
        setUpdated(data.updated);
      } catch {
        return;
      }
    }

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return { rates, updated };
}

export function convertCurrency(
  rates: Record<string, number>,
  amount: number,
  from: string,
  to: string,
) {
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return null;
  return (amount / fromRate) * toRate;
}

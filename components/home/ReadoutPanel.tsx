"use client";

import { convertCurrency, useExchangeRates } from "@/lib/use-exchange-rates";

export function ReadoutPanel() {
  const { rates } = useExchangeRates();
  const live = rates ? convertCurrency(rates, 1, "USD", "EUR") : null;

  return (
    <div className="border-line bg-surface mt-14 flex max-w-[720px] flex-wrap items-center gap-10 rounded-[6px] border px-[26px] py-[22px]">
      <div className="font-mono">
        <div className="text-text-dim mb-1.5 text-[12px] tracking-[0.08em] uppercase">
          BMI
        </div>
        <div className="text-amber text-[24px]">23.4</div>
      </div>
      <div className="font-mono">
        <div className="text-text-dim mb-1.5 text-[12px] tracking-[0.08em] uppercase">
          Loan EMI
        </div>
        <div className="text-steel text-[24px]">
          $842
          <span className="text-text-dim text-[14px]">/mo</span>
        </div>
      </div>
      <div className="font-mono">
        <div className="text-text-dim mb-1.5 text-[12px] tracking-[0.08em] uppercase">
          Age
        </div>
        <div className="text-amber text-[24px]">27y 4m</div>
      </div>
      <div className="font-mono">
        <div className="text-text-dim mb-1.5 text-[12px] tracking-[0.08em] uppercase">
          USD → EUR
        </div>
        <div className="text-steel text-[24px]">
          {live == null ? "—" : live.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

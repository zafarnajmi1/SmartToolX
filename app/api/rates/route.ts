import { NextResponse } from "next/server";

type RatePayload = {
  result?: string;
  rates?: Record<string, number>;
  time_last_update_utc?: string;
};

export async function GET() {
  const response = await fetch("https://open.er-api.com/v6/latest/USD", {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { rates: null, updated: null },
      { status: 502 },
    );
  }

  const data = (await response.json()) as RatePayload;
  if (data.result !== "success" || !data.rates) {
    return NextResponse.json(
      { rates: null, updated: null },
      { status: 502 },
    );
  }

  return NextResponse.json({
    rates: data.rates,
    updated: data.time_last_update_utc ?? null,
  });
}

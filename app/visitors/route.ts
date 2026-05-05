import { NextResponse } from "next/server";

export async function GET() {
  try {
    const teamId = process.env.VERCEL_TEAM_ID;
    const projectId = process.env.VERCEL_PROJECT_ID;
    const token = process.env.VERCEL_ACCESS_TOKEN;

    if (!token || !projectId) {
      return NextResponse.json({ visitors: null });
    }

    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const to = now.toISOString();

    const url = `https://vercel.com/api/web-analytics/timeseries?projectId=${projectId}${
      teamId ? `&teamId=${teamId}` : ""
    }&from=${from}&to=${to}&filter=%7B%7D&granularity=month`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    const total =
      json.data?.reduce(
        (sum: number, d: { visitors: number }) => sum + (d.visitors || 0),
        0
      ) ?? 0;

    return NextResponse.json({ visitors: total });
  } catch {
    return NextResponse.json({ visitors: null });
  }
}
import { getSubcycles } from "@/app/actions";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cycleId = searchParams.get("cycleId");

  if (!cycleId) return new Response("No cycleId provided", { status: 400 });

  const subcycles = await getSubcycles(cycleId);

  return new Response(JSON.stringify(subcycles));
}

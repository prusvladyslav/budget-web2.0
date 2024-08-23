import { categoriesActions, subcyclesActions } from "@/app/actions";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const cycleId = searchParams.get("cycleId");

  if (!cycleId) return new Response("No cycleId provided", { status: 400 });

  const categories = await categoriesActions.getCategoriesByCycleId({
    cycleId,
    categoryType: "all",
  });

  const subcycles = await subcyclesActions.getSubcyclesByCycleId(cycleId);

  const result = {
    subcycles,
    categories,
  };

  return new Response(JSON.stringify(result));
}

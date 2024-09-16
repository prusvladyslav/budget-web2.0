import { db } from "@/db";
import { cycleTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const cycleId = searchParams.get("cycleId");

  if (!cycleId) return new Response("No cycleId provided", { status: 400 });

  const cycle = await db.query.cycleTable.findFirst({
    columns: {},
    where: eq(cycleTable.id, cycleId),
    with: {
      subcycles: {
        columns: {
          id: true,
          title: true,
        },
      },
      categories: {
        columns: {
          id: true,
          title: true,
          weekly: true,
          subcycleId: true,
          initialAmount: true,
        },
      },
    },
  });

  if (!cycle) return new Response("No cycle found", { status: 400 });

  const categories = cycle.categories;

  const subcycles = cycle.subcycles;

  const result = {
    subcycles,
    categories: {
      weekly: categories?.filter((category) => category.weekly === true),
      monthly: categories?.filter((category) => category.weekly === false),
    },
  };

  return new Response(JSON.stringify(result));
}

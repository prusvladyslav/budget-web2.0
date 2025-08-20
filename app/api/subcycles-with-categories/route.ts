import { db } from "@/db";
import { cycleTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

const cors = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  },
};

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
        with: {
          expenses: {
            columns: {
              amount: true,
            },
          },
        },
      },
    },
  });

  if (!cycle) return new Response("No cycle found", { status: 400 });

  const categories = cycle.categories.map((category) => {
    return {
      ...category,
      currentAmount:
        category.initialAmount -
        category.expenses.reduce((acc, item) => acc + item.amount, 0),
    };
  });

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

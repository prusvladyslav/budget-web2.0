import { type CategoryType, getCategories } from "@/app/actions";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const cycleId = searchParams.get("cycleId");

  const categoryType = searchParams.get("categoryType");

  const withAmount = searchParams.get("withAmount");

  if (!cycleId) return new Response("No cycleId provided", { status: 400 });

  if (!categoryType || !["weekly", "monthly", "all"].includes(categoryType)) {
    return new Response("Unkown category type", { status: 400 });
  }

  if (withAmount !== "true") {
    const subcycles = await getCategories({
      cycleId,
      categoryType: categoryType as CategoryType,
    });

    return new Response(JSON.stringify(subcycles));
  }
  // const subcycleIds = searchParams.get("subcycleIds");

  // if (!subcycleIds)
  //   return new Response("No subcycleId provided", { status: 400 });

  // const categoriesWithCurrentAmount = await getCategoriesWithCurrentAmount({
  //   cycleId,
  //   categoryType: categoryType as CategoryType,
  //   subcycleIds: subcycleIds.split(","),
  // });

  // return new Response(JSON.stringify(categoriesWithCurrentAmount));
}

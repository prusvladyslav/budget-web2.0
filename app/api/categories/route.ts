// import { categoriesActions } from "@/app/actions";
// import { NextRequest } from "next/server";

// export async function GET(request: NextRequest) {
//   const searchParams = request.nextUrl.searchParams;

//   const cycleId = searchParams.get("cycleId");

//   const categoryType = searchParams.get("categoryType");

//   if (!cycleId) return new Response("No cycleId provided", { status: 400 });

//   if (!categoryType || !["weekly", "monthly", "all"].includes(categoryType)) {
//     return new Response("Unkown category type", { status: 400 });
//   }

//   const categories = await categoriesActions.getCategoriesByCycleId({
//     cycleId,
//     categoryType: categoryType as categoriesActions.CategoryType,
//   });

//   return new Response(JSON.stringify(categories));
// }

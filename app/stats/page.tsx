import SubpageHeader from "@/components/common/SubpageHeader";
import { getUser } from "../actions/users";
import CycleChart from "@/components/stats/CycleChart/CycleChart";
import { getExpensesBySubcycle } from "../actions/stats";
import StatsSelectCycle from "@/components/stats/StatsSelectCycle/StatsSelectCycle";
import { getCycles } from "../actions/cycles";

export default async function Page({
  searchParams,
}: {
  searchParams: { cycleId: string };
}) {
  const [user, cycles] = await Promise.all([getUser(), getCycles()]);

  const data = await getExpensesBySubcycle(
    searchParams.cycleId || user?.lastOpenedCycleId || ""
  );

  if (!user || !cycles) return null;

  return (
    <>
      <div className="flex space-x-4 items-center justify-between">
        <SubpageHeader pageTitle="Statistics" user={user} />
        <StatsSelectCycle
          lastOpenedCycleId={user.lastOpenedCycleId}
          cycles={cycles}
        />
      </div>

      <CycleChart byAmount={data.byAmount || []} />
    </>
  );
}

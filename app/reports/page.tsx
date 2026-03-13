import SubpageHeader from "@/components/common/SubpageHeader";
import { usersActions, cyclesActions } from "@/app/actions";
import { getMonthlyReports } from "@/app/actions/report";
import ReportCard from "@/components/reports/ReportCard";
import TrendOverview from "@/components/reports/TrendOverview";

export default async function Page() {
  const [user, reports, cycles] = await Promise.all([
    usersActions.getUser(),
    getMonthlyReports(),
    cyclesActions.getCycles(),
  ]);

  if (!user) return null;

  return (
    <div>
      <SubpageHeader user={user} pageTitle="Monthly Reports" />
      <div className="mt-5">
        <TrendOverview reports={reports} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No monthly reports yet. Create one when adding a new cycle.
          </p>
        ) : (
          reports.map((report, index) => (
            <ReportCard key={report.id} report={report} previousReport={reports[index + 1] ?? null} cycles={cycles ?? []} />
          ))
        )}
      </div>
    </div>

  );
}

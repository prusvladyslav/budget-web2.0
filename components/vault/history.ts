import type { SelectVaultSnapshot } from "@/db/schema";

export type HistoryRange = "1m" | "3m" | "6m" | "1y" | "all";

export const HISTORY_RANGES: Array<{
	value: HistoryRange;
	label: string;
	months: number | null;
}> = [
	{ value: "1m", label: "1M", months: 1 },
	{ value: "3m", label: "3M", months: 3 },
	{ value: "6m", label: "6M", months: 6 },
	{ value: "1y", label: "1Y", months: 12 },
	{ value: "all", label: "All", months: null },
];

/** SQLite CURRENT_TIMESTAMP has no zone suffix, but represents UTC. */
export function snapshotDate(value: string) {
	const normalized = value.includes("T") ? value : value.replace(" ", "T");
	return new Date(
		/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized) ? normalized : `${normalized}Z`,
	);
}

export function snapshotsInRange(
	snapshots: SelectVaultSnapshot[],
	range: HistoryRange,
	now = new Date(),
) {
	const months = HISTORY_RANGES.find((item) => item.value === range)?.months;
	if (months == null) return snapshots;
	const start = new Date(now);
	const day = start.getDate();
	start.setDate(1);
	start.setMonth(start.getMonth() - months);
	const lastDayOfMonth = new Date(
		start.getFullYear(),
		start.getMonth() + 1,
		0,
	).getDate();
	start.setDate(Math.min(day, lastDayOfMonth));
	return snapshots.filter(
		(snapshot) => snapshotDate(snapshot.createdAt) >= start,
	);
}

export function lastSnapshotPerDay(snapshots: SelectVaultSnapshot[]) {
	const byDay = new Map<string, SelectVaultSnapshot>();
	for (const snapshot of snapshots) {
		const date = snapshotDate(snapshot.createdAt);
		byDay.set(
			`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
			snapshot,
		);
	}
	return Array.from(byDay.values());
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SelectVaultSnapshot } from "@/db/schema";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
	HISTORY_RANGES,
	type HistoryRange,
	snapshotDate,
	snapshotsInRange,
} from "./history";

type Currency = "uah" | "usd";

function money(value: number, currency: Currency) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency.toUpperCase(),
		maximumFractionDigits: 2,
	}).format(value);
}

function amount(snapshot: SelectVaultSnapshot, currency: Currency) {
	return currency === "uah" ? snapshot.totalUah : snapshot.totalUsd;
}

export default function VaultHistoryDetails({
	snapshots,
}: { snapshots: SelectVaultSnapshot[] }) {
	const [range, setRange] = useState<HistoryRange>("3m");
	const [currency, setCurrency] = useState<Currency>("uah");
	const inRange = useMemo(
		() => snapshotsInRange(snapshots, range),
		[snapshots, range],
	);
	const data = useMemo(
		() =>
			inRange.map((snapshot) => ({
				time: snapshotDate(snapshot.createdAt).getTime(),
				value: amount(snapshot, currency),
			})),
		[inRange, currency],
	);
	const first = inRange[0];
	const latest = inRange[inRange.length - 1];
	const change =
		first && latest ? amount(latest, currency) - amount(first, currency) : null;
	const changePercent =
		first && change !== null && amount(first, currency) !== 0
			? (change / Math.abs(amount(first, currency))) * 100
			: null;
	const bounds = inRange.reduce<{ lowest: number; highest: number } | null>(
		(result, snapshot) => {
			const value = amount(snapshot, currency);
			return result === null
				? { lowest: value, highest: value }
				: {
						lowest: Math.min(result.lowest, value),
						highest: Math.max(result.highest, value),
					};
		},
		null,
	);
	const sign = change !== null && change > 0 ? "+" : "";

	return (
		<div className="mt-5 space-y-5">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold">Net Worth History</h1>
					<p className="text-sm text-muted-foreground">
						Your saved vault balances over time.
					</p>
				</div>
				<Tabs
					value={currency}
					onValueChange={(value) => setCurrency(value as Currency)}
				>
					<TabsList aria-label="Display currency">
						<TabsTrigger value="uah">UAH</TabsTrigger>
						<TabsTrigger value="usd">USD</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			<Card>
				<CardHeader className="space-y-3">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<CardTitle className="text-lg">Balance trend</CardTitle>
						<Tabs
							value={range}
							onValueChange={(value) => setRange(value as HistoryRange)}
						>
							<TabsList aria-label="History period">
								{HISTORY_RANGES.map((item) => (
									<TabsTrigger
										key={item.value}
										value={item.value}
										className="px-2 sm:px-3"
									>
										{item.label}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>
				</CardHeader>
				<CardContent>
					{data.length < 2 ? (
						<p className="py-10 text-center text-sm text-muted-foreground">
							{snapshots.length === 0
								? "Save vault changes to start tracking net worth."
								: "Not enough snapshots in this range. Try a longer range."}
						</p>
					) : (
						<ChartContainer
							config={{
								value: { label: currency.toUpperCase(), color: "#2563eb" },
							}}
							className="h-[300px] sm:h-[400px] w-full aspect-auto"
						>
							<LineChart
								data={data}
								accessibilityLayer
								margin={{ top: 8, right: 10, bottom: 4, left: 4 }}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="time"
									type="number"
									scale="time"
									domain={["dataMin", "dataMax"]}
									tickLine={false}
									axisLine={false}
									tickMargin={10}
									minTickGap={32}
									tickFormatter={(value: number) =>
										new Date(value).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
										})
									}
								/>
								<YAxis
									tickLine={false}
									axisLine={false}
									width={78}
									domain={["auto", "auto"]}
									tickFormatter={(value: number) =>
										new Intl.NumberFormat("en-US", {
											notation: "compact",
											maximumFractionDigits: 1,
										}).format(value)
									}
								/>
								<ChartTooltip
									content={
										<ChartTooltipContent
											labelFormatter={(_, payload) => {
												const time = payload?.[0]?.payload?.time;
												return typeof time === "number"
													? new Date(time).toLocaleString("en-US", {
															dateStyle: "medium",
															timeStyle: "short",
														})
													: "";
											}}
											formatter={(value) => money(Number(value), currency)}
										/>
									}
								/>
								<Line
									type="monotone"
									dataKey="value"
									stroke="#2563eb"
									strokeWidth={2}
									dot={data.length <= 60 ? { r: 2 } : false}
									activeDot={{ r: 5 }}
								/>
							</LineChart>
						</ChartContainer>
					)}
				</CardContent>
			</Card>

			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<Metric
					label="Latest balance"
					value={latest ? money(amount(latest, currency), currency) : "—"}
				/>
				<Metric
					label="Change in period"
					value={change === null ? "—" : `${sign}${money(change, currency)}`}
					detail={
						changePercent === null
							? undefined
							: `${sign}${changePercent.toFixed(1)}% from first snapshot`
					}
				/>
				<Metric
					label="Lowest balance"
					value={bounds === null ? "—" : money(bounds.lowest, currency)}
				/>
				<Metric
					label="Highest balance"
					value={bounds === null ? "—" : money(bounds.highest, currency)}
				/>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Snapshots</CardTitle>
					<p className="text-sm text-muted-foreground">
						{inRange.length} saved{" "}
						{inRange.length === 1 ? "balance" : "balances"} in this period.
						Older history keeps one snapshot per day.
					</p>
				</CardHeader>
				<CardContent>
					{inRange.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No snapshots in this range.
						</p>
					) : (
						<div className="max-h-[420px] overflow-auto rounded-md border">
							<table className="w-full min-w-[460px] text-sm">
								<thead className="sticky top-0 bg-background text-left text-muted-foreground">
									<tr className="border-b">
										<th className="p-3 font-medium">Saved at</th>
										<th className="p-3 text-right font-medium">UAH</th>
										<th className="p-3 text-right font-medium">USD</th>
									</tr>
								</thead>
								<tbody>
									{[...inRange].reverse().map((snapshot) => (
										<tr key={snapshot.id} className="border-b last:border-0">
											<td className="p-3 whitespace-nowrap">
												{snapshotDate(snapshot.createdAt).toLocaleString(
													"en-US",
													{ dateStyle: "medium", timeStyle: "short" },
												)}
											</td>
											<td className="p-3 text-right tabular-nums">
												{money(snapshot.totalUah, "uah")}
											</td>
											<td className="p-3 text-right tabular-nums">
												{money(snapshot.totalUsd, "usd")}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function Metric({
	label,
	value,
	detail,
}: { label: string; value: string; detail?: string }) {
	return (
		<Card>
			<CardContent className="p-4">
				<p className="text-xs text-muted-foreground">{label}</p>
				<p className="mt-1 text-lg font-semibold tabular-nums break-words">
					{value}
				</p>
				{detail && (
					<p className="mt-1 text-xs text-muted-foreground">{detail}</p>
				)}
			</CardContent>
		</Card>
	);
}

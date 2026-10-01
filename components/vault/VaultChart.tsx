"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SelectVaultSnapshot } from "@/db/schema";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
	HISTORY_RANGES,
	type HistoryRange,
	lastSnapshotPerDay,
	snapshotDate,
	snapshotsInRange,
} from "./history";

export default function VaultChart({
	snapshots,
}: { snapshots: SelectVaultSnapshot[] }) {
	const [range, setRange] = useState<HistoryRange>("3m");
	const [currency, setCurrency] = useState<"uah" | "usd">("uah");
	const data = useMemo(
		() =>
			lastSnapshotPerDay(snapshotsInRange(snapshots, range)).map((snapshot) => {
				const date = snapshotDate(snapshot.createdAt);
				return {
					date: date.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					}),
					fullDate: date.toLocaleString("en-US", {
						dateStyle: "medium",
						timeStyle: "short",
					}),
					value: Math.round(
						currency === "uah" ? snapshot.totalUah : snapshot.totalUsd,
					),
				};
			}),
		[snapshots, range, currency],
	);

	return (
		<Card>
			<CardHeader className="p-3 sm:p-4 pb-2 space-y-3">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="text-base font-semibold">
						Net Worth History
					</CardTitle>
					<Link
						href="/vault/history"
						className="shrink-0 text-xs font-medium text-primary hover:underline"
					>
						View details →
					</Link>
				</div>
				{snapshots.length > 1 && (
					<div className="flex flex-wrap items-center gap-2">
						<Tabs
							value={range}
							onValueChange={(value) => setRange(value as HistoryRange)}
						>
							<TabsList className="h-8 max-w-full">
								{HISTORY_RANGES.map((item) => (
									<TabsTrigger
										key={item.value}
										value={item.value}
										className="h-6 px-2 text-xs"
									>
										{item.label}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
						<Tabs
							value={currency}
							onValueChange={(value) => setCurrency(value as "uah" | "usd")}
						>
							<TabsList className="h-8" aria-label="Display currency">
								<TabsTrigger value="uah" className="h-6 px-2 text-xs">
									UAH
								</TabsTrigger>
								<TabsTrigger value="usd" className="h-6 px-2 text-xs">
									USD
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				)}
			</CardHeader>
			<CardContent className="p-3 sm:p-4 pt-0">
				{snapshots.length < 2 ? (
					<p className="text-sm text-muted-foreground">
						Save vault changes to start tracking net worth.
					</p>
				) : data.length < 2 ? (
					<p className="text-sm text-muted-foreground">
						Not enough snapshots in this range. Try a longer range.
					</p>
				) : (
					<ChartContainer
						config={{
							value: { label: currency.toUpperCase(), color: "#2563eb" },
						}}
						className="h-[190px] w-full aspect-auto"
					>
						<LineChart data={data} accessibilityLayer>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="date"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								minTickGap={24}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								tickFormatter={(value: number) => value.toLocaleString()}
								width={65}
								domain={["auto", "auto"]}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent
										labelFormatter={(_, payload) =>
											payload?.[0]?.payload?.fullDate
										}
										formatter={(value) =>
											`${Number(value).toLocaleString()} ${currency === "uah" ? "₴" : "$"}`
										}
									/>
								}
							/>
							<Line
								type="monotone"
								dataKey="value"
								stroke="#2563eb"
								strokeWidth={2}
								dot={false}
								activeDot={{ r: 5 }}
							/>
						</LineChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}

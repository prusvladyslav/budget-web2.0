"use client";
import CycleContextMenu from "@/components/contextMenus/CycleContextMenu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { TabsTrigger } from "../../ui/tabs";
import { useCycleContext } from "../MainTable";

export default function MainTableHeader() {
	const { selectedCycleId, updateCycleId, cycles } = useCycleContext();

	// setting selected cycle to the first one if the previous selected was deleted
	useEffect(() => {
		if (!cycles) return;

		const selectedCycleExists = cycles.some(
			(cycle) => cycle.id === selectedCycleId,
		);
		if (!selectedCycleExists && cycles.length > 0) {
			updateCycleId(cycles[0].id);
		}
	}, [cycles, selectedCycleId, updateCycleId]);

	const [bodyWidth, setBodyWidth] = useState(0);

	const updateBodyWidth = useCallback(() => {
		setBodyWidth(document.body.clientWidth);
	}, []);

	useEffect(() => {
		updateBodyWidth();
		window.addEventListener("resize", updateBodyWidth);

		return () => {
			window.removeEventListener("resize", updateBodyWidth);
		};
	}, [updateBodyWidth]);

	if (!bodyWidth)
		return (
			<div
				className="min-h-[30px]
  )"
			/>
		);

	return (
		<ScrollArea
			style={{ width: `${bodyWidth - 48 - 16}px` }}
			className="whitespace-nowrap"
		>
			<div className="flex w-max space-x-2">
				{cycles?.map((cycle) => (
					<div
						className={cn(
							"space-x-2 shadow-lg border flex items-center px-3 py-1.5",
							selectedCycleId === cycle.id && "bg-background",
						)}
						key={cycle.id}
					>
						<TabsTrigger
							value={cycle.id}
							className="p-0 data-[state=active]:shadow-none"
						>
							<span className="text-xs sm:text-base">{cycle.title}</span>
						</TabsTrigger>
						<CycleContextMenu cycle={cycle}>
							<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
						</CycleContextMenu>
					</div>
				))}
			</div>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	);
}

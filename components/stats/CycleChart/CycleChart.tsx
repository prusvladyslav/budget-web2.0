"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ChartByAmount from "./ChartByAmount";

type Props = {
  byAmount: Array<{
    title: string;
    initialAmount: number;
    currentAmount: number;
  }>;
};

export default function CycleChart({ byAmount }: Props) {
  return (
    <Card className="p-4 flex flex-col space-y-4">
      <CardHeader className="p-0 flex flex-row items-center gap-4">
        Cycle chart
      </CardHeader>

      <CardContent className="pt-2 max-h-[300px]">
        <ChartByAmount data={byAmount} />
      </CardContent>
    </Card>
  );
}

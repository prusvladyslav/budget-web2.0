import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type CurrencyTotal = {
  currency: string;
  amount: number;
};

type Props = {
  totals: {
    currencyTotals: { currency: string; amount: number }[];
    generalTotal: { uahTotal: number; usdTotal: number };
  } | null;
};

export default function VaultTotal({ totals }: Props) {
  const currencyTotals = totals?.currencyTotals;
  const uahTotal = totals?.generalTotal.uahTotal;
  const usdTotal = totals?.generalTotal.usdTotal;
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Currency Totals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currencyTotals?.map((total) => {
            return (
              <div
                key={total.currency}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{total.currency}</span>
                </div>
                <span className="text-lg font-semibold">
                  {total.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            );
          })}
          <Separator className="my-4" />
          <div className="flex justify-between">
            <span className="font-bold text-lg">Total</span>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary text-right">
                {uahTotal?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ₴
              </span>
              <Separator className="my-2" />
              <span className="text-xl font-bold text-primary text-right">
                {usdTotal?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                $
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

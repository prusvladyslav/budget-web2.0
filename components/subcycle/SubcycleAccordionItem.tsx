"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SelectSubcycle } from "@/db/schema";
import { CategoryWithCurrentAmount } from "../main/CycleTab/CycleTab";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Menu } from "../common/Menu";
import { cn } from "@/lib/utils";

interface SubcycleAccordionItemProps {
  subcycle: SelectSubcycle;
  categories: CategoryWithCurrentAmount;
  monthly?: boolean;
}

type ConditionalProps =
  | {
      monthly: true;
      categories: CategoryWithCurrentAmount;
      subcycle?: never;
    }
  | {
      monthly: false;
      subcycle: SelectSubcycle;
      categories: CategoryWithCurrentAmount;
    };

type Props = ConditionalProps;

function SubcycleAccordionItem({
  subcycle,
  categories,
  monthly = false,
}: Props) {
  const router = useRouter();

  const menuItems = useMemo(() => {
    const baseItems = [
      {
        id: 1,
        name: "Add expense",
        onClick: (categoryId: string) =>
          router.push(
            `/?expensesModal=active&categoryId=${categoryId}&monthly=${monthly}`
          ),
      },
    ];

    if (!monthly) {
      baseItems.push(
        {
          id: 2,
          name: "Move budget",
          onClick: (categoryId: string) =>
            router.push(`/?moveBudget=active&categoryId=${categoryId}`),
        },
        {
          id: 3,
          name: "Expenses history",
          onClick: () => router.push(`/expenses`),
        }
      );
    }

    return baseItems;
  }, [router, monthly]);

  const totalInitial = useMemo(
    () => categories.reduce((acc, category) => acc + category.initialAmount, 0),
    [categories]
  );
  const totalCurrent = useMemo(
    () => categories.reduce((acc, category) => acc + category.currentAmount, 0),
    [categories]
  );

  return (
    <AccordionItem value={monthly ? "1" : subcycle?.id ?? ""}>
      <AccordionTrigger className="bg-muted p-4 group">
        {monthly ? "Monthly" : subcycle?.title}
      </AccordionTrigger>
      <AccordionContent>
        <DesktopView
          categories={categories}
          menuItems={menuItems}
          totalInitial={totalInitial}
          totalCurrent={totalCurrent}
          monthly={monthly}
        />
        <MobileView
          categories={categories}
          menuItems={menuItems}
          totalInitial={totalInitial}
          totalCurrent={totalCurrent}
          monthly={monthly}
        />
      </AccordionContent>
    </AccordionItem>
  );
}

export default memo(SubcycleAccordionItem);

interface ViewProps {
  categories: CategoryWithCurrentAmount;
  menuItems: Array<{
    id: number;
    name: string;
    onClick: (categoryId: string) => void;
  }>;
  totalInitial: number;
  totalCurrent: number;
  monthly?: boolean;
}

function DesktopView({
  categories,
  menuItems,
  totalInitial,
  totalCurrent,
  monthly,
}: ViewProps) {
  return (
    <Table className="hidden md:table">
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Initial</TableHead>
          <TableHead>Current</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="font-extrabold">{category.title}</TableCell>
            <TableCell>{category.initialAmount}</TableCell>
            <TableCell>{category.currentAmount}</TableCell>
            <TableCell className="flex justify-end mr-8">
              <Menu
                items={menuItems.map((item) => ({
                  ...item,
                  onClick: () => item.onClick(category.id),
                }))}
              />
            </TableCell>
          </TableRow>
        ))}
        {!monthly && (
          <TableRow className="bg-gray-50">
            <TableCell className="font-black text-base">Total</TableCell>
            <TableCell className="font-black text-base">
              {totalInitial}
            </TableCell>
            <TableCell className="font-black text-base">
              {totalCurrent}
            </TableCell>
            <TableCell className="text-right"></TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function MobileView({
  categories,
  menuItems,
  totalInitial,
  totalCurrent,
  monthly,
}: ViewProps) {
  return (
    <div className="md:hidden">
      {categories.map((category, index) => (
        <Card
          className={cn(
            "rounded-t-none shadow-md",
            index === 0 && "rounded-b-none border-b-0 border-t-0"
          )}
          key={category.id}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-extrabold">
              {category.title}
            </CardTitle>
            <div className="flex justify-end">
              <Menu
                items={menuItems.map((item) => ({
                  ...item,
                  onClick: () => item.onClick(category.id),
                }))}
              />
            </div>
          </CardHeader>
          <CardContent className="flex justify-between gap-4">
            <span>Initial: {category.initialAmount}</span>
            <span>Current: {category.currentAmount}</span>
          </CardContent>
        </Card>
      ))}
      {!monthly && (
        <Card className={cn("mt-2 bg-gray-50 shadow-md")}>
          <CardHeader>
            <CardTitle className="text-lg font-extrabold">Total</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between">
            <span className="font-black">Initial: {totalInitial}</span>
            <span className="font-black">Current: {totalCurrent}</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

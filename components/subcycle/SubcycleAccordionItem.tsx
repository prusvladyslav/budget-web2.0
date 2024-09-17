"use client";
import { SelectSubcycle } from "@/db/schema";
import { AccordionItem, AccordionTrigger } from "../ui/accordion";
import { CategoryWithCurrentAmount } from "../main/CycleTab/CycleTab";
import { AccordionContent } from "../ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Menu } from "../common/Menu";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

function SubcycleAccordionItem({
  subcycle,
  categories,
}: {
  subcycle: SelectSubcycle;
  categories: CategoryWithCurrentAmount;
}) {
  const router = useRouter();
  return (
    <AccordionItem value={subcycle.id}>
      <AccordionTrigger className="bg-muted p-4 group">
        {subcycle.title}
      </AccordionTrigger>
      <AccordionContent className="">
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
                <TableCell className="font-extrabold">
                  {category.title}
                </TableCell>
                <TableCell>{category.initialAmount}</TableCell>
                <TableCell>{category.currentAmount}</TableCell>
                <TableCell className="flex justify-end mr-8">
                  <Menu
                    items={[
                      {
                        id: 1,
                        name: "Add expense",
                        onClick: () =>
                          router.push(
                            `/?expensesModal=active&categoryId=${category.id}`
                          ),
                      },
                      {
                        id: 2,
                        name: "Move budget",
                        onClick: () =>
                          router.push(
                            `/?moveBudget=active&categoryId=${category.id}`
                          ),
                      },
                      {
                        id: 3,
                        name: "Expenses history",
                        onClick: () => router.push(`/expenses`),
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-50">
              <TableCell className="font-black text-base">Total</TableCell>
              <TableCell className="font-black text-base">
                {categories.reduce(
                  (acc, category) => acc + category.initialAmount,
                  0
                )}
              </TableCell>
              <TableCell className="font-black text-base">
                {categories.reduce(
                  (acc, category) => acc + category.currentAmount,
                  0
                )}
              </TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className="md:hidden">
          {categories.map((category, index) => {
            return (
              <Card
                className={cn(
                  "rounded-t-none",
                  index === 0 && "rounded-b-none"
                )}
                key={category.id}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-extrabold">
                    {category.title}
                  </CardTitle>
                  <div className="flex justify-end">
                    <Menu
                      items={[
                        {
                          id: 1,
                          name: "Add expense",
                          onClick: () =>
                            router.push(
                              `/?expensesModal=active&categoryId=${category.id}`
                            ),
                        },
                        {
                          id: 2,
                          name: "Move budget",
                          onClick: () =>
                            router.push(
                              `/?moveBudget=active&categoryId=${category.id}`
                            ),
                        },
                        {
                          id: 3,
                          name: "Expenses history",
                          onClick: () => router.push(`/expenses`),
                        },
                      ]}
                    />
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <span>Initial: {category.initialAmount}</span>
                  <span>Current: {category.currentAmount}</span>
                </CardContent>
              </Card>
            );
          })}
          <Card className={cn("mt-2 bg-gray-50")}>
            <CardHeader>
              <CardTitle className="text-lg font-extrabold">Total</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <span className="font-black text-base">
                Initial:{" "}
                {categories.reduce(
                  (acc, category) => acc + category.initialAmount,
                  0
                )}
              </span>
              <span className="font-black text-base">
                Current:{" "}
                {categories.reduce(
                  (acc, category) => acc + category.currentAmount,
                  0
                )}
              </span>
            </CardContent>
          </Card>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default memo(SubcycleAccordionItem);

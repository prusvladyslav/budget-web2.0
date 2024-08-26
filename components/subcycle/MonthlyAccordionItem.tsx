import { SelectCycle, SelectSubcycle, SelectUser } from "@/db/schema";
import { AccordionItem, AccordionTrigger } from "../ui/accordion";
import { CategoryWithCurrentAmount } from "../main/CycleTab/CycleTab";
import AddNewExpense from "../modals/AddNewExpense";
import { AccordionContent } from "../ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function SubcycleAccordionItem({
  categories,
}: {
  categories: CategoryWithCurrentAmount;
}) {
  return (
    <AccordionItem value={"1"}>
      <AccordionTrigger className="bg-muted p-4 group">
        Monthly
      </AccordionTrigger>
      <AccordionContent className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Initial Amount</TableHead>
              <TableHead>Current Amount</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.title}</TableCell>
                <TableCell>{category.initialAmount}</TableCell>
                <TableCell>{category.currentAmount}</TableCell>
                <TableCell className="text-right">
                  <AddNewExpense categoryId={category.id} monthly={true} />
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
      </AccordionContent>
    </AccordionItem>
  );
}

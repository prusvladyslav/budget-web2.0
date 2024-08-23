import { AccordionContent } from "../ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { CategoryWithCurrentAmount } from "../main/CycleTab/CycleTab";
import AddNewExpense from "../modals/AddNewExpense";
import { SelectCycle } from "@/db/schema";

export default function SubcycleAccordionContent({
  categories,
  cycles,
}: {
  categories: CategoryWithCurrentAmount;
  cycles: SelectCycle[];
}) {
  return (
    <AccordionContent className="p-4">
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
                <AddNewExpense cycles={cycles} categoryId={category.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AccordionContent>
  );
}

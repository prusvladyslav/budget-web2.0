import {
  SelectCategory,
  SelectCategoryWithCurrentAmount,
  SelectExpense,
} from "@/db/schema";
import { AccordionContent } from "../ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
export default function SubcycleAccordionContent({
  categories,
  subcycleId,
}: {
  categories: SelectCategoryWithCurrentAmount[];
  subcycleId: string;
}) {
  return (
    <AccordionContent className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Initial Amount</TableHead>
            <TableHead>Current Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.title}</TableCell>
              <TableCell>{category.initialAmount}</TableCell>
              <TableCell>{category.currentAmount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AccordionContent>
  );
}

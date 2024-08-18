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

export default function SubcycleAccordionContent({
  categories,
}: {
  categories: CategoryWithCurrentAmount;
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

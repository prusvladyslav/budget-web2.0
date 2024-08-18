import { SelectSubcycle } from "@/db/schema";
import { AccordionItem, AccordionTrigger } from "../ui/accordion";
import SubcycleAccordionContent from "./SubcycleAccordionContent";
import { CategoryWithCurrentAmount } from "../main/CycleTab/CycleTab";

export default function SubcycleAccordionItem({
  subcycle,
  categories,
  selectedSubcycle,
}: {
  subcycle: SelectSubcycle;
  selectedSubcycle: string;
  categories: CategoryWithCurrentAmount;
}) {
  return (
    <AccordionItem value={subcycle.id}>
      <AccordionTrigger className="bg-muted p-4 group">
        {subcycle.title}
      </AccordionTrigger>
      {selectedSubcycle === subcycle.id && (
        <SubcycleAccordionContent categories={categories} />
      )}
    </AccordionItem>
  );
}

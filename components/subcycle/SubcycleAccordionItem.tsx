import { SelectCycle, SelectSubcycle, SelectUser } from "@/db/schema";
import { AccordionItem, AccordionTrigger } from "../ui/accordion";
import SubcycleAccordionContent from "./SubcycleAccordionContent";
import { CategoryWithCurrentAmount } from "../main/CycleTab/CycleTab";
import { useCycleContext } from "../main/MainTable";

export default function SubcycleAccordionItem({
  subcycle,
  categories,
  cycles,
}: {
  subcycle: SelectSubcycle;
  categories: CategoryWithCurrentAmount;
  cycles: SelectCycle[];
}) {
  const { selectedSubcycle } = useCycleContext();

  return (
    <AccordionItem value={subcycle.id}>
      <AccordionTrigger className="bg-muted p-4 group">
        {subcycle.title}
      </AccordionTrigger>
      <SubcycleAccordionContent cycles={cycles} categories={categories} />
    </AccordionItem>
  );
}

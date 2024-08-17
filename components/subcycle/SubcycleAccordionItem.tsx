import {
  SelectCategory,
  SelectCategoryWithCurrentAmount,
  SelectSubcycle,
} from "@/db/schema";
import { AccordionItem, AccordionTrigger } from "../ui/accordion";
import SubcycleAccordionContent from "./SubcycleAccordionContent";

export default function SubcycleAccordionItem({
  subcycle,
  categories,
  selectedSubcycle,
}: {
  subcycle: SelectSubcycle;
  selectedSubcycle: string;
  categories: SelectCategoryWithCurrentAmount[];
}) {
  return (
    <AccordionItem value={subcycle.id}>
      <AccordionTrigger className="bg-muted p-4 group">
        {subcycle.title}
      </AccordionTrigger>
      {selectedSubcycle === subcycle.id && (
        <SubcycleAccordionContent
          categories={categories}
          subcycleId={subcycle.id}
        />
      )}
    </AccordionItem>
  );
}

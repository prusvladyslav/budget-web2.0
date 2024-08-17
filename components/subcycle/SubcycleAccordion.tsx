import {
  SelectCategory,
  SelectCategoryWithCurrentAmount,
  SelectSubcycle,
  SelectUser,
} from "@/db/schema";
import { Accordion } from "../ui/accordion";
import SubcycleAccordionItem from "./SubcycleAccordionItem";
import { useSubcycleState } from "./useSubcycleAccordion";
import { DebouncedFunc } from "lodash";
import { URLS, useGet } from "@/lib/fetch";

export default function SubcycleAccordion({
  subcycles,
  debouncedUpdateUserSubcycle,
  user,
  cycleId,
}: {
  user: SelectUser;
  subcycles: SelectSubcycle[];
  debouncedUpdateUserSubcycle: DebouncedFunc<(value: string) => Promise<void>>;
  cycleId: string;
}) {
  const { selectedSubcycle, updateSelectedSubcycleValue } = useSubcycleState(
    user.lastOpenedSubcycleId || "",
    debouncedUpdateUserSubcycle
  );

  const { data: weeklyCategoriesData } = useGet<
    SelectCategoryWithCurrentAmount[]
  >(URLS.categories + "?cycleId=" + cycleId + "&categoryType=weekly");

  const { data: monthlyCategoriesData } = useGet<SelectCategory[]>(
    URLS.categories + "?cycleId=" + cycleId + "&categoryType=monthly"
  );

  const monthlyCategories = monthlyCategoriesData?.data;

  const weeklyCategories = weeklyCategoriesData?.data;

  if (!weeklyCategories || !monthlyCategories) return null;

  return (
    <Accordion
      type="single"
      collapsible
      value={selectedSubcycle}
      onValueChange={updateSelectedSubcycleValue}
    >
      {subcycles.map((subcycle) => {
        return (
          <SubcycleAccordionItem
            selectedSubcycle={selectedSubcycle}
            categories={weeklyCategories}
            key={subcycle.id}
            subcycle={subcycle}
          />
        );
      })}
      {/* <AccordionItem value={subcycle.id}>
      <AccordionTrigger className="bg-muted p-4 group">
        {subcycle.title}
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Initial Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.title}</TableCell>
                <TableCell>{category.initialAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionContent>
    </AccordionItem> */}
    </Accordion>
  );
}

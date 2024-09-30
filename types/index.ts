export type Category = {
  id: string;
  title: string;
  weekly: boolean;
  subcycleId: string | null;
  initialAmount: number;
  currentAmount: number;
};

export type getSubcyclesByCycleIdWithCategories = {
  subcycles: { id: string; title: string }[];
  categories: { weekly: Category[]; monthly: Category[] };
};

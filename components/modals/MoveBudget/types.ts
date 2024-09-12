export type Props = {
  categoryId?: string | null;
  monthly?: boolean;
  open: boolean;
};

export type Category = {
  id: string;
  title: string;
  weekly: boolean;
  subcycleId: string | null;
};

export type getSubcyclesByCycleIdWithCategories = {
  subcycles: { id: string; title: string }[];
  categories: { weekly: Category[]; monthly: Category[] };
};

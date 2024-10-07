import {
  Bus,
  CarTaxiFront,
  CircleEllipsis,
  Film,
  Ham,
  Shirt,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import type { TLabelName } from "./const";

const defaultIconProps = {
  width: 16,
  height: 16,
};

export const useGetIcon = (icon: TLabelName) => {
  switch (icon) {
    case "groceries":
      return <Ham {...defaultIconProps} />;
    case "restaurant":
      return <Utensils {...defaultIconProps} />;
    case "transport":
      return <Bus {...defaultIconProps} />;
    case "entertainment":
      return <Film {...defaultIconProps} />;
    case "shopping":
      return <ShoppingBag {...defaultIconProps} />;
    case "food delivery":
      return <CarTaxiFront {...defaultIconProps} />;
    case "clothing":
      return <Shirt {...defaultIconProps} />;
    case "other":
      return <CircleEllipsis {...defaultIconProps} />;
    default:
      break;
  }
};

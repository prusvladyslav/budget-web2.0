import {
  Bus,
  CarTaxiFront,
  CircleEllipsis,
  CreditCard,
  Film,
  GraduationCap,
  Ham,
  Heart,
  Pill,
  Receipt,
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
    case "eating out":
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
    case "subscriptions":
      return <CreditCard {...defaultIconProps} />;
    case "education":
      return <GraduationCap {...defaultIconProps} />;
    case "drugs":
      return <Pill {...defaultIconProps} />;
    case "health":
      return <Heart {...defaultIconProps} />;
    case "utility bills":
      return <Receipt {...defaultIconProps} />;
    case "other":
      return <CircleEllipsis {...defaultIconProps} />;
    default:
      break;
  }
};

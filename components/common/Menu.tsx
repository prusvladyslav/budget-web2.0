import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Ellipsis } from "lucide-react";

type Props = {
  items: {
    id: number;
    name: string;
    onClick: () => void;
  }[];
};

export function Menu({ items }: Props) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>
          <Ellipsis className="h-4 w-4" />
        </MenubarTrigger>
        <MenubarContent className="min-w-[0px]">
          {items.map((item) => {
            return (
              <MenubarItem
                className="px-4"
                key={item.id}
                onClick={() => item.onClick && item.onClick()}
              >
                {item.name}
              </MenubarItem>
            );
          })}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

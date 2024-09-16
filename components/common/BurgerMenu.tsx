import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SelectUser } from "@/db/schema";
import { SignOutButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import GeneralLink from "./GeneralLink";
import { Separator } from "@/components/ui/separator";

export function BurgerMenu({ user }: { user: SelectUser }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side={"left"}
        className="flex flex-col justify-between items-start"
      >
        <div className="space-y-4">
          <SheetHeader>
            <SheetTitle className="text-start">
              Hello, <span className="font-bold">{user?.name}</span>
            </SheetTitle>
            <SheetDescription className="text-left">
              This is the main menu of the app.
            </SheetDescription>
          </SheetHeader>
          <Separator />
          <div>
            <h2>Links:</h2>
            <div className="flex flex-col mt-2">
              <GeneralLink href="/">Main page</GeneralLink>
              <GeneralLink href="/settings">User Settings</GeneralLink>
              <GeneralLink href="/expenses">Expenses History</GeneralLink>
              <GeneralLink href="/vault">Vault</GeneralLink>
            </div>
          </div>
          <Separator />
        </div>
        <SheetFooter>
          <Button variant="default">
            <SignOutButton />
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

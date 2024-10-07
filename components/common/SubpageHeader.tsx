import type { SelectUser } from "@/db/schema";
import { BurgerMenu } from "./BurgerMenu";

type Props = {
  user: SelectUser | null | undefined;
  pageTitle: string;
};
export default function SubpageHeader({ user, pageTitle }: Props) {
  if (!user) return null;
  return (
    <div className="flex items-center space-x-4">
      <BurgerMenu user={user} />
      <h2 className="text-lg font-bold">{pageTitle}</h2>
    </div>
  );
}

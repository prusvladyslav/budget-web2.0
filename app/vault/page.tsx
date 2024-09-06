import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import VaultForm from "@/components/vault/VaultForm";
import { getVault, getVaultTotal } from "../actions/vault";
import { BurgerMenu } from "@/components/common/BurgerMenu";
import { usersActions } from "../actions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import VaultTotal from "@/components/vault/VaultTotal";

export default async function Page() {
  const accounts = await getVault();
  const totals = await getVaultTotal();
  const user = await usersActions.getUser();
  if (!user) return null;
  return (
    <div>
      <BurgerMenu user={user} />
      <div className="flex flex-col space-y-5 md:space-y-0 md:flex-row md:space-x-10 mt-5">
        <Suspense fallback={<VaultSkeleton />}>
          <VaultForm accounts={accounts} />
        </Suspense>
        <VaultTotal totals={totals} />
      </div>
    </div>
  );
}

const VaultSkeleton = () => {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((_, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    </div>
  );
};

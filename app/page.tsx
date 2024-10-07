"use server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import MainTable from "@/components/main/MainTable";
import { SWRProvider } from "@/components/common/SWRprovider";
import { usersActions } from "./actions";
import { Suspense } from "react";
import { getUserWithCycle } from "./actions/users";

export default async function Home() {
  const clerUser = await currentUser();

  if (!clerUser) return null;

  const user = await getUserWithCycle();
  const cycles = user?.cycles || [];

  if (!user) {
    const newUser = await usersActions.createUser(
      clerUser.fullName || "no name provided",
      clerUser.id
    );

    if (!newUser) return null;

    const newUserWithCycles = {
      ...newUser[0],
      lastOpenedCycleId: null,
      lastOpenedSubcycleId: null,
      debug: false,
    };
    return (
      <SWRProvider>
        <MainTable cycles={[]} user={newUserWithCycles} />
      </SWRProvider>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SWRProvider>
        <MainTable cycles={cycles} user={user} />
      </SWRProvider>
    </Suspense>
  );
}

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import MainTable from "@/components/main/MainTable";
import { SWRProvider } from "@/components/common/SWRprovider";
import { cyclesActions, usersActions } from "./actions";

export default async function Home() {
  const clerUser = await currentUser();

  if (!clerUser) return null;

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, clerUser.id),
  });

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

  const cycles = await cyclesActions.getCycles();

  return (
    <SWRProvider>
      <MainTable cycles={cycles} user={user} />
    </SWRProvider>
  );
}

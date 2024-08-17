import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { createUser, getCycles } from "./actions";
import MainTable from "@/components/main/MainTable";
import UserProfileDialog from "@/components/common/UserProfileDialog";
import { SWRConfig } from "swr";
import { SWRProvider } from "@/components/common/SWRprovider";

export default async function Home() {
  const clerUser = await currentUser();

  if (!clerUser) return null;

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, clerUser.id),
  });

  if (!user) {
    const newUser = await createUser(
      clerUser.fullName || "no name provided",
      clerUser.id
    );

    if (!newUser) return null;

    const newUserWithCycles = {
      ...newUser[0],
      lastOpenedCycleId: null,
      lastOpenedSubcycleId: null,
    };
    return (
      <>
        <UserProfileDialog user={newUserWithCycles} />
        <MainTable cycles={[]} user={newUserWithCycles} />
      </>
    );
  }

  const cycles = await getCycles();

  return (
    <SWRProvider>
      <UserProfileDialog user={user} />
      <MainTable cycles={cycles} user={user} />
    </SWRProvider>
  );
}

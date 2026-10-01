import { usersActions } from "@/app/actions";
import { getVaultSnapshots } from "@/app/actions/vault";
import SubpageHeader from "@/components/common/SubpageHeader";
import VaultHistoryDetails from "@/components/vault/VaultHistoryDetails";
import Link from "next/link";

export default async function Page() {
	const [user, snapshots] = await Promise.all([
		usersActions.getUser(),
		getVaultSnapshots(),
	]);
	if (!user) return null;

	return (
		<div>
			<SubpageHeader user={user} pageTitle="Net Worth History" />
			<Link
				href="/vault"
				className="mt-5 inline-block text-sm text-muted-foreground hover:text-foreground hover:underline"
			>
				← Back to Vault
			</Link>
			<VaultHistoryDetails snapshots={snapshots} />
		</div>
	);
}

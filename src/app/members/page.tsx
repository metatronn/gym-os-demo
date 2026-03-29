import { getMembers, getMemberCounts } from "./actions";
import MembersClient from "./members-client";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const [members, counts] = await Promise.all([
    getMembers(),
    getMemberCounts(),
  ]);

  return <MembersClient initialMembers={members} counts={counts} />;
}

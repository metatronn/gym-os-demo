import { getLeads, getLeadCounts } from "./actions";
import LeadsClient from "./leads-client";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const [leads, counts] = await Promise.all([getLeads(), getLeadCounts()]);

  return <LeadsClient initialLeads={leads} initialCounts={counts} />;
}

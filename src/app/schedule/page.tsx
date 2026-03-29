import { getSchedule } from "./actions";
import ScheduleClient from "./schedule-client";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const classes = await getSchedule();

  return <ScheduleClient classes={classes} />;
}

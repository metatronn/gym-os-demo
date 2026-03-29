import { getTasks } from "./actions";
import TasksClient from "./tasks-client";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await getTasks();

  return <TasksClient tasks={tasks} />;
}

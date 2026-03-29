"use server";

import { revalidatePath } from "next/cache";
import { messageQueries } from "@/db/queries/messages";
import { tenantDb } from "@/db/tenant";

export async function getMessages() {
  const tenant = await tenantDb();
  return messageQueries(tenant).list();
}

export async function markMessageRead(id: string) {
  const tenant = await tenantDb();
  const message = await messageQueries(tenant).markRead(id);

  revalidatePath("/messages");
  return message;
}

export async function getUnreadCount() {
  const tenant = await tenantDb();
  return messageQueries(tenant).countUnread();
}

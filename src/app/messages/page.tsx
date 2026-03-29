import { getMessages, getUnreadCount } from "./actions";
import MessagesClient from "./messages-client";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const [messages, unreadCount] = await Promise.all([
    getMessages(),
    getUnreadCount(),
  ]);

  return <MessagesClient messages={messages} unreadCount={unreadCount} />;
}

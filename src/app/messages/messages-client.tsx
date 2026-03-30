"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Message } from "@/db/schema/messages";
import { markMessageRead } from "./actions";
import {
  Search,
  MessageSquare,
  Mail,
  Phone,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  User,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessagesClientProps {
  messages: Message[];
  unreadCount: number;
}

export default function MessagesClient({
  messages,
  unreadCount,
}: MessagesClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedMsg, setSelectedMsg] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | "sms" | "email">(
    "all",
  );

  const filtered = messages.filter((m) => {
    const matchSearch = m.contactName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchChannel = channelFilter === "all" || m.channel === channelFilter;
    return matchSearch && matchChannel;
  });

  const selected = messages.find((m) => m.id === selectedMsg);
  const selectedConversation: Array<{
    id: string;
    from: "them" | "us";
    text: string;
    time: string;
  }> = selected
    ? [
        {
          id: `${selected.id}-latest`,
          from: "them",
          text:
            selected.lastMessage?.trim() ||
            "No recent message content is available for this conversation.",
          time: new Date(selected.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]
    : [];

  async function handleSelectMessage(id: string) {
    setSelectedMsg(id);
    const msg = messages.find((m) => m.id === id);
    if (msg?.unread) {
      await markMessageRead(id);
      router.refresh();
    }
  }

  return (
    <div className="flex h-full">
      {/* Conversation List -- hidden on mobile when a conversation is selected */}
      <div
        className={`${selectedMsg ? "hidden lg:flex" : "flex"} w-full lg:w-[340px] border-r border-border flex-col`}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-foreground">Messages</h1>
            <Badge>{unreadCount} new</Badge>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex rounded-lg overflow-hidden border border-border">
            {(["all", "sms", "email"] as const).map((ch) => (
              <Button
                key={ch}
                variant={channelFilter === ch ? "default" : "ghost"}
                size="sm"
                onClick={() => setChannelFilter(ch)}
                className={cn(
                  "flex-1 rounded-none capitalize",
                  channelFilter === ch ? "" : "text-muted-foreground",
                )}
              >
                {ch === "all" ? "All" : ch.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => handleSelectMessage(msg.id)}
              className={cn(
                "p-3 border-b border-border/50 cursor-pointer transition-colors",
                selectedMsg === msg.id
                  ? "bg-primary/10 border-l-2 border-l-primary"
                  : "hover:bg-secondary/50",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {msg.contactName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {msg.unread && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        msg.unread
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {msg.contactName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {msg.channel === "sms" ? (
                      <MessageSquare className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    )}
                    <p
                      className={cn(
                        "text-xs truncate",
                        msg.unread
                          ? "text-muted-foreground font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      {msg.lastMessage}
                    </p>
                  </div>
                  {msg.contactType && (
                    <Badge
                      variant={
                        msg.contactType === "member" ? "success" : "default"
                      }
                      className="mt-1 text-[10px] px-1.5 py-0"
                    >
                      {msg.contactType}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Conversation View -- full width on mobile when selected */}
      <div
        className={`${selectedMsg ? "flex" : "hidden lg:flex"} flex-1 flex-col`}
      >
        {selected ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedMsg(null)}
                  className="lg:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar>
                  <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                    {selected.contactName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {selected.contactName}
                  </h3>
                  <span className="text-xs text-muted-foreground capitalize">
                    {selected.contactType} &middot;{" "}
                    {selected.channel ? selected.channel.toUpperCase() : ""}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:inline-flex"
                >
                  <User className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {selectedConversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === "us" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl",
                      msg.from === "us"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md",
                    )}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1",
                        msg.from === "us"
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground",
                      )}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div className="rounded-xl border border-border bg-card/70 p-3 text-xs text-muted-foreground">
                Showing the latest synced message for this conversation.
              </div>
            </div>

            {/* Input */}
            <div className="p-3 lg:p-4 border-t border-border">
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:inline-flex"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                <Button size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}

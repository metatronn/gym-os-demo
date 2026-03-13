'use client';

import { useState } from 'react';
import { messages } from '@/lib/data';
import {
  Search, MessageSquare, Mail, Phone, Send,
  Paperclip, Smile, MoreVertical, User, ArrowLeft
} from 'lucide-react';

const fakeConversation = [
  { id: 1, from: 'them', text: "Can I bring a friend to class this Thursday?", time: '2:32 PM' },
  { id: 2, from: 'us', text: "Of course! First-timers get a free trial class. Just have them sign a waiver at the front desk 15 min before class.", time: '2:35 PM' },
  { id: 3, from: 'them', text: "Awesome! She's excited. What should she wear?", time: '2:37 PM' },
  { id: 4, from: 'us', text: "Comfortable workout clothes, clean sneakers, and bring water. We provide gloves and wraps for trial members. See you Thursday!", time: '2:40 PM' },
];

export default function MessagesPage() {
  const [search, setSearch] = useState('');
  const [selectedMsg, setSelectedMsg] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'sms' | 'email'>('all');

  const filtered = messages.filter(m => {
    const matchSearch = m.contactName.toLowerCase().includes(search.toLowerCase());
    const matchChannel = channelFilter === 'all' || m.channel === channelFilter;
    return matchSearch && matchChannel;
  });

  const selected = messages.find(m => m.id === selectedMsg);
  const unreadCount = messages.filter(m => m.unread).length;

  return (
    <div className="flex h-full">
      {/* Conversation List — hidden on mobile when a conversation is selected */}
      <div className={`${selectedMsg ? 'hidden lg:flex' : 'flex'} w-full lg:w-[340px] border-r border-gym-border flex-col`}>
        <div className="p-4 border-b border-gym-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gym-text">Messages</h1>
            <span className="text-xs bg-gym-primary text-white px-2 py-0.5 rounded-full">{unreadCount} new</span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gym-text-muted" />
            <input type="text" placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gym-card border border-gym-border rounded-lg text-gym-text text-sm placeholder:text-gym-text-muted focus:outline-none focus:border-gym-primary" />
          </div>
          <div className="flex bg-gym-card border border-gym-border rounded-lg overflow-hidden">
            {(['all', 'sms', 'email'] as const).map(ch => (
              <button key={ch} onClick={() => setChannelFilter(ch)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium capitalize ${channelFilter === ch ? 'bg-gym-primary text-white' : 'text-gym-text-secondary'}`}>{ch === 'all' ? 'All' : ch.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {filtered.map(msg => (
            <div key={msg.id} onClick={() => setSelectedMsg(msg.id)}
              className={`p-3 border-b border-gym-border/50 cursor-pointer transition-colors ${selectedMsg === msg.id ? 'bg-gym-primary/10 border-l-2 border-l-gym-primary' : 'hover:bg-gym-bg/50'}`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gym-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-gym-primary">
                    {msg.contactName.split(' ').map(n => n[0]).join('')}
                  </div>
                  {msg.unread && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gym-primary rounded-full border-2 border-gym-card" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${msg.unread ? 'text-gym-text' : 'text-gym-text-secondary'}`}>{msg.contactName}</span>
                    <span className="text-[10px] text-gym-text-muted">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {msg.channel === 'sms' ? <MessageSquare className="w-3 h-3 text-gym-text-muted flex-shrink-0" /> : <Mail className="w-3 h-3 text-gym-text-muted flex-shrink-0" />}
                    <p className={`text-xs truncate ${msg.unread ? 'text-gym-text-secondary font-medium' : 'text-gym-text-muted'}`}>{msg.lastMessage}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${msg.contactType === 'member' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {msg.contactType}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation View — full width on mobile when selected */}
      <div className={`${selectedMsg ? 'flex' : 'hidden lg:flex'} flex-1 flex-col`}>
        {selected ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gym-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedMsg(null)} className="lg:hidden p-1 hover:bg-gym-bg rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-gym-text-muted" />
                </button>
                <div className="w-10 h-10 bg-gym-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-gym-primary">
                  {selected.contactName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gym-text">{selected.contactName}</h3>
                  <span className="text-xs text-gym-text-muted capitalize">{selected.contactType} &middot; {selected.channel.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gym-bg rounded-lg"><Phone className="w-4 h-4 text-gym-text-muted" /></button>
                <button className="p-2 hover:bg-gym-bg rounded-lg hidden sm:block"><User className="w-4 h-4 text-gym-text-muted" /></button>
                <button className="p-2 hover:bg-gym-bg rounded-lg"><MoreVertical className="w-4 h-4 text-gym-text-muted" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {fakeConversation.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'us' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl ${msg.from === 'us' ? 'bg-gym-primary text-white rounded-br-md' : 'bg-gym-card border border-gym-border text-gym-text rounded-bl-md'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.from === 'us' ? 'text-white/60' : 'text-gym-text-muted'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 lg:p-4 border-t border-gym-border">
              <div className="flex items-center gap-2 bg-gym-card border border-gym-border rounded-xl p-2">
                <button className="p-2 hover:bg-gym-bg rounded-lg"><Paperclip className="w-4 h-4 text-gym-text-muted" /></button>
                <input type="text" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gym-text placeholder:text-gym-text-muted focus:outline-none" />
                <button className="p-2 hover:bg-gym-bg rounded-lg hidden sm:block"><Smile className="w-4 h-4 text-gym-text-muted" /></button>
                <button className="p-2 bg-gym-primary rounded-lg hover:bg-gym-primary/80"><Send className="w-4 h-4 text-white" /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gym-text-muted">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Mic, SendHorizontal } from 'lucide-react';

interface WorkflowStep {
  number: number;
  title: string;
  status: 'pending' | 'scheduled' | 'decision';
  details?: string;
}

interface Message {
  type: 'user' | 'ai';
  content: string;
  workflow?: {
    title: string;
    steps: WorkflowStep[];
  };
}

const quickActions = [
  'Follow up with all new leads',
  'Check in on at-risk members',
  'Show billing issues',
  'Daily summary',
];

export default function CommandPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'ai',
      content: 'Good morning, Javier. What would you like me to do?',
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      if (input.toLowerCase().includes('cancel')) {
        const aiMessage: Message = {
          type: 'ai',
          content: 'I found 3 members at risk of cancellation. Executing retention workflow...',
          workflow: {
            title: 'Cancel Retention Workflow',
            steps: [
              {
                number: 1,
                title: 'Send "Last Chance" email',
                status: 'scheduled',
                details: 'Personalized offer email scheduled for today',
              },
              {
                number: 2,
                title: 'Wait 3 days for response',
                status: 'pending',
                details: 'Monitoring for replies and engagement',
              },
              {
                number: 3,
                title: 'Decision point',
                status: 'decision',
                details: '3a: If accepted → Keep active | 3b: If no response → Cancel',
              },
              {
                number: 4,
                title: 'Send "Goodbye" email + SMS',
                status: 'pending',
                details: 'Exit communication sequence',
              },
            ],
          },
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const aiMessage: Message = {
          type: 'ai',
          content: 'Processing your request. This feature will analyze your gym data and recommend actions.',
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    }, 500);

    setInput('');
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gym-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors animate-pulse"
        aria-label="Open Command Panel"
      >
        <Sparkles size={24} />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-[400px] bg-gym-sidebar border-l border-gym-border shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="p-6 border-b border-gym-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gym-text">Command Center</h2>
              <div className="mt-1 inline-block px-2 py-0.5 bg-gym-primary/20 rounded text-xs text-gym-primary font-medium">
                GYM OS AI
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gym-text-secondary hover:text-gym-text transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.type === 'user'
                      ? 'bg-gym-primary text-white'
                      : 'bg-gym-card text-gym-text'
                  }`}
                >
                  {msg.content}

                  {/* Workflow Card */}
                  {msg.workflow && (
                    <div className="mt-4 bg-gym-sidebar border border-gym-border rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold text-gym-text text-xs uppercase">
                        {msg.workflow.title}
                      </h3>
                      <div className="space-y-2">
                        {msg.workflow.steps.map((step) => (
                          <div key={step.number} className="text-xs">
                            <div className="flex items-start gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                  step.status === 'scheduled'
                                    ? 'bg-gym-warning text-gym-sidebar'
                                    : step.status === 'decision'
                                      ? 'bg-gym-accent text-gym-sidebar'
                                      : 'bg-gym-border text-gym-text-muted'
                                }`}
                              >
                                {step.number}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gym-text">
                                  {step.title}
                                </p>
                                {step.details && (
                                  <p className="text-gym-text-muted mt-0.5">
                                    {step.details}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gym-border">
                        <button className="flex-1 bg-gym-primary text-white py-1.5 rounded text-xs font-medium hover:bg-blue-600 transition-colors">
                          Confirm & Execute
                        </button>
                        <button className="flex-1 bg-gym-border text-gym-text py-1.5 rounded text-xs font-medium hover:bg-gym-card transition-colors">
                          Modify
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (visible when first opened) */}
          {messages.length === 1 && (
            <div className="px-6 pb-4 space-y-2">
              <p className="text-xs text-gym-text-muted mb-2">Quick Actions</p>
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className="w-full text-left px-3 py-2 bg-gym-card hover:bg-gym-border rounded text-xs text-gym-text transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-gym-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a command or ask anything..."
                className="flex-1 bg-gym-card border border-gym-border rounded px-3 py-2 text-sm text-gym-text placeholder-gym-text-muted focus:outline-none focus:border-gym-primary transition-colors"
              />
              <button className="p-2 text-gym-text-secondary hover:text-gym-text transition-colors">
                <Mic size={18} />
              </button>
              <button
                onClick={handleSend}
                className="p-2 bg-gym-primary text-white rounded hover:bg-blue-600 transition-colors"
              >
                <SendHorizontal size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

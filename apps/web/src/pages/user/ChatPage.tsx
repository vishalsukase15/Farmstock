import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send, MessageSquare, Tractor, User as UserIcon, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useSocket } from '../../context/SocketContext.js';
import { Conversation, Message } from '../../types/index.js';
import { formatINR } from '../../components/product/PriceDisplay.js';
import api from '../../services/api.js';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation list
  useEffect(() => {
    api.get('/chat/conversations')
      .then((res) => {
        if (res.data.success) {
          setConversations(res.data.data);
          if (res.data.data.length > 0) {
            setActiveConvId(res.data.data[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;

    api.get(`/chat/conversations/${activeConvId}/messages`)
      .then((res) => {
        if (res.data.success) {
          setMessages(res.data.data);
        }
      })
      .catch((err) => console.error(err));

    // Join room via socket
    if (socket) {
      socket.emit('join_conversation', activeConvId);
    }

    return () => {
      if (socket && activeConvId) {
        socket.emit('leave_conversation', activeConvId);
      }
    };
  }, [activeConvId, socket]);

  // Socket event listeners for real-time messages & typing
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      if (msg.conversationId === activeConvId) {
        setMessages((prev) => [...prev, msg]);
      }

      // Update last message in conversation sidebar
      setConversations((prev) =>
        prev.map((c) => (c.id === msg.conversationId ? { ...c, lastMessage: msg } : c))
      );
    };

    const handleUserTyping = (data: { conversationId: string; userName: string }) => {
      if (data.conversationId === activeConvId) {
        setTypingUser(data.userName);
      }
    };

    const handleUserStopTyping = (data: { conversationId: string }) => {
      if (data.conversationId === activeConvId) {
        setTypingUser(null);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, activeConvId]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId || !user) return;

    const content = newMessage.trim();
    setNewMessage('');

    // Emit through socket for instant real-time delivery
    if (socket) {
      socket.emit('send_message', {
        conversationId: activeConvId,
        senderId: user.id,
        content,
      });
      socket.emit('stop_typing', { conversationId: activeConvId });
    } else {
      // Fallback to REST
      try {
        const res = await api.post(`/chat/conversations/${activeConvId}/messages`, { content });
        if (res.data.success) {
          setMessages((prev) => [...prev, res.data.data]);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (socket && activeConvId && user) {
      socket.emit('typing', {
        conversationId: activeConvId,
        userName: user.profile?.fullName || 'Farmer',
      });
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const filteredConversations = conversations.filter((c) =>
    c.participant?.profile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[750px]">
        {/* LEFT SIDEBAR: CONVERSATION LIST */}
        <aside className="md:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-200 space-y-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-700" />
              <span>Farmer Messages</span>
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading chats...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No conversations yet. Visit a machinery listing and click "Chat with Owner".
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                      isActive ? 'bg-primary-50 border-r-4 border-primary-700' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 font-bold flex items-center justify-center shrink-0 text-sm">
                      {conv.participant?.profile?.fullName?.charAt(0) || 'F'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {conv.participant?.profile?.fullName || 'Farmer'}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {conv.lastMessage?.createdAt
                            ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                      {conv.product && (
                        <p className="text-[11px] font-semibold text-primary-700 truncate">
                          🚜 {conv.product.name}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {conv.lastMessage?.content || 'No messages yet.'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT PANE: ACTIVE CHAT ROOM */}
        <main className="md:col-span-8 flex flex-col h-full bg-white">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 font-bold flex items-center justify-center text-sm">
                    {activeConv.participant?.profile?.fullName?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      {activeConv.participant?.profile?.fullName || 'Farmer'}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Direct Peer-to-Peer Communication
                    </p>
                  </div>
                </div>

                {/* Linked Product Quick Card */}
                {activeConv.product && (
                  <Link
                    to={`/products/${activeConv.product.id}`}
                    className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors max-w-xs"
                  >
                    <Tractor className="w-4 h-4 text-primary-700 shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="text-[11px] font-bold text-slate-900 truncate">{activeConv.product.name}</p>
                      <p className="text-[10px] text-primary-800 font-extrabold">
                        {formatINR(activeConv.product.salePrice || activeConv.product.rentalDailyRate || 0)}
                      </p>
                    </div>
                  </Link>
                )}
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-primary-700 text-white rounded-br-xs shadow-md'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                {typingUser && (
                  <div className="text-xs text-slate-400 italic">
                    {typingUser} is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type message to equipment owner or buyer..."
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-primary-500 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-primary-700 hover:bg-primary-800 text-white rounded-2xl transition-all shadow disabled:opacity-40"
                  aria-label="Send Message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-200" />
              <h3 className="text-sm font-bold text-slate-700">No conversation selected</h3>
              <p className="text-xs max-w-xs">
                Select an existing discussion from the left sidebar or start a new chat from any equipment listing.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

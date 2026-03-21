import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import NeuralBackground from '../components/NeuralBackground';
import SEO from '../components/SEO';

interface Conversation {
  id: string;
  other: { id: string; name: string; avatar?: string };
  lastMessage?: string;
  lastMessageAt?: string;
  unread: number;
}

const Inbox: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    API.getConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  function timeAgo(dateStr?: string) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="relative min-h-screen">
      <SEO title="Messages" canonical="/messages" description="Your messages on Cenner" />
      <NeuralBackground parallax={false} />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <MessageCircle className="text-brand-green" size={28} />
          <h1 className="text-3xl font-black text-white tracking-tight">Messages</h1>
        </div>

        {loading ? (
          <div className="text-gray-500 text-sm">Loading…</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-gray-500">No conversations yet.</p>
            <p className="text-gray-600 text-sm mt-1">Start a conversation from a freelancer's profile.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => navigate(`/messages/${conv.id}`)}
                className="w-full flex items-center gap-4 p-4 bg-brand-grey/70 border border-white/5 rounded-2xl hover:border-brand-green/30 hover:bg-brand-green/5 transition-all text-left"
              >
                <div className="relative flex-shrink-0">
                  {conv.other.avatar ? (
                    <img src={conv.other.avatar} alt={conv.other.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green font-black text-lg">
                      {conv.other.name[0]}
                    </div>
                  )}
                  {conv.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-green rounded-full flex items-center justify-center text-brand-black text-[10px] font-black">
                      {conv.unread > 9 ? '9+' : conv.unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`font-bold text-sm ${conv.unread > 0 ? 'text-white' : 'text-gray-300'}`}>{conv.other.name}</span>
                    <div className="flex items-center gap-1 text-gray-600 text-xs">
                      <Clock size={11} />
                      {timeAgo(conv.lastMessageAt)}
                    </div>
                  </div>
                  <p className={`text-sm truncate ${conv.unread > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;

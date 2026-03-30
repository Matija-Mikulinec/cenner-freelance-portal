import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import SEO from '../components/SEO';

interface SavedItem {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
    category?: string;
    user?: { name: string };
  };
}

const SavedListings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    API.getSavedListings().then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, [user, navigate]);

  const handleUnsave = async (listingId: string) => {
    await API.unsaveListing(listingId).catch(() => {});
    setItems(prev => prev.filter(i => i.listing?.id !== listingId));
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-24">
      <SEO title="Saved Listings" />
      <h1 className="text-3xl font-extrabold text-white mb-8">Saved Listings</h1>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-500" size={32} />
        </div>
      ) : items.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center">
          <Heart size={48} className="text-gray-700 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No saved listings</h2>
          <p className="text-gray-500 mb-6">Save listings you like to find them quickly later.</p>
          <Link to="/marketplace" className="px-8 py-3 bg-brand-green text-brand-black font-bold rounded-xl hover:scale-105 transition-all">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-zinc-900/80 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-white/20 transition-colors">
              <Link to={`/service/${item.listing?.id}`} className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green shrink-0">
                  <Heart size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{item.listing?.title}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {item.listing?.user?.name || 'Unknown'}{item.listing?.category ? ` · ${item.listing.category}` : ''}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-white font-black">&euro;{item.listing?.price?.toFixed(2)}</span>
                <button onClick={() => handleUnsave(item.listing?.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedListings;

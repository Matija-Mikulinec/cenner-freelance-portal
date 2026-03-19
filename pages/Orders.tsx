
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle2, XCircle, ArrowRight, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NeuralBackground from '../components/NeuralBackground';
import { useT } from '../i18n';

type OrderStatus = 'active' | 'completed' | 'cancelled';

interface Order {
  id: string;
  title: string;
  counterparty: string;
  amount: number;
  status: OrderStatus;
  date: string;
  category: string;
}

// Placeholder — replace with real API call when orders backend is ready
const MOCK_ORDERS: Order[] = [];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'In Progress', color: 'text-brand-green bg-brand-green/10 border-brand-green/20', icon: <Clock size={12} /> },
  completed: { label: 'Completed', color: 'text-gray-400 bg-white/5 border-white/10', icon: <CheckCircle2 size={12} /> },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <XCircle size={12} /> },
};

const Orders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  if (!user) return null;

  const filtered = filter === 'all' ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === filter);

  const tabs: { key: 'all' | OrderStatus; label: string; count: number }[] = [
    { key: 'all', label: t('All Orders'), count: MOCK_ORDERS.length },
    { key: 'active', label: t('Active'), count: MOCK_ORDERS.filter(o => o.status === 'active').length },
    { key: 'completed', label: t('Completed'), count: MOCK_ORDERS.filter(o => o.status === 'completed').length },
    { key: 'cancelled', label: t('Cancelled'), count: MOCK_ORDERS.filter(o => o.status === 'cancelled').length },
  ];

  return (
    <div className="relative min-h-screen pt-12 pb-24 px-4 overflow-hidden">
      <NeuralBackground parallax={false} />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-green mb-2">{t('Your Activity')}</p>
          <h1 className="text-4xl font-black text-white tracking-tighter">{t('Orders')}</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">{t('Track all your active and past engagements.')}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                filter === tab.key
                  ? 'bg-brand-green text-brand-black shadow-lg shadow-brand-green/20'
                  : 'bg-brand-grey/40 border border-white/5 text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${filter === tab.key ? 'bg-brand-black/20' : 'bg-white/5'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="bg-brand-grey/40 border border-white/5 rounded-3xl p-16 text-center">
            <Package size={40} className="text-gray-700 mx-auto mb-5" />
            <h3 className="text-white font-black text-xl mb-2">{t('No orders yet')}</h3>
            <p className="text-gray-600 text-sm max-w-sm mx-auto mb-8">
              {user.role === 'freelancer'
                ? t('Once a client places an order for your service, it will appear here.')
                : t('Once you place an order with a freelancer, it will show up here.')}
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-green text-brand-black font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all"
            >
              {user.role === 'freelancer' ? t('Create a Listing') : t('Explore Marketplace')}
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status];
              return (
                <div key={order.id} className="bg-brand-grey/40 border border-white/5 rounded-2xl p-6 flex items-center justify-between gap-4 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green shrink-0">
                      <Briefcase size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-bold text-sm truncate">{order.title}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">{order.counterparty} · {order.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-white font-black">€{order.amount}</span>
                    <span className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span className="text-gray-600 text-xs hidden md:block">{order.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

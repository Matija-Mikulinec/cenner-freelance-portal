import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import NeuralBackground from '../components/NeuralBackground';
import SEO from '../components/SEO';

interface Contract {
  id: string;
  title: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  clientId: string;
  client: { id: string; name: string; avatar?: string };
  freelancer: { id: string; name: string; avatar?: string };
  milestones: { id: string; status: string; amount: number }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT:     { label: 'Pending acceptance', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: <Clock size={12} /> },
  ACTIVE:    { label: 'Active',             color: 'text-brand-green bg-brand-green/10 border-brand-green/20', icon: <CheckCircle2 size={12} /> },
  COMPLETED: { label: 'Completed',          color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: <CheckCircle2 size={12} /> },
  DISPUTED:  { label: 'Disputed',           color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: <AlertTriangle size={12} /> },
  CANCELLED: { label: 'Cancelled',          color: 'text-gray-500 bg-gray-500/10 border-gray-500/20', icon: <XCircle size={12} /> },
};

const Contracts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    API.getContracts()
      .then(setContracts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  function milestoneProgress(milestones: Contract['milestones']) {
    const released = milestones.filter(m => m.status === 'RELEASED').length;
    return { released, total: milestones.length };
  }

  return (
    <div className="relative min-h-screen">
      <SEO title="Contracts" canonical="/contracts" description="Your contracts on Cenner" />
      <NeuralBackground parallax={false} />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileText className="text-brand-green" size={28} />
            <h1 className="text-3xl font-black text-white tracking-tight">Contracts</h1>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500 text-sm">Loading…</div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-gray-500">No contracts yet.</p>
            <p className="text-gray-600 text-sm mt-1">Contracts are created when you hire a freelancer.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map(contract => {
              const cfg = STATUS_CONFIG[contract.status] || STATUS_CONFIG.DRAFT;
              const { released, total } = milestoneProgress(contract.milestones);
              const isClient = contract.client.id === user?.id;
              const other = isClient ? contract.freelancer : contract.client;
              return (
                <button
                  key={contract.id}
                  onClick={() => navigate(`/contracts/${contract.id}`)}
                  className="w-full flex items-center gap-4 p-5 bg-brand-grey/70 border border-white/5 rounded-2xl hover:border-brand-green/30 transition-all text-left"
                >
                  <div className="flex-shrink-0">
                    {other.avatar ? (
                      <img src={other.avatar} alt={other.name} className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green font-black">
                        {other.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm truncate">{contract.title}</span>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">{isClient ? 'With' : 'For'} {other.name} · {released}/{total} milestones</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-black">€{contract.totalAmount.toFixed(2)}</p>
                    <p className="text-gray-600 text-xs">total</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contracts;

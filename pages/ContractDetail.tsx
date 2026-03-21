import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Clock, AlertTriangle, Star,
  DollarSign, Send, ShieldCheck, MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../lib/api';
import NeuralBackground from '../components/NeuralBackground';
import SEO from '../components/SEO';

interface Milestone {
  id: string; title: string; description?: string;
  amount: number; dueDate?: string; order: number; status: string;
}
interface Review {
  id: string; rating: number; comment?: string;
  reviewer: { id: string; name: string; avatar?: string }; createdAt: string;
}
interface Contract {
  id: string; title: string; description?: string; status: string; totalAmount: number;
  clientId: string; freelancerId: string;
  client: { id: string; name: string; avatar?: string; avgRating?: number; reviewCount: number };
  freelancer: { id: string; name: string; avatar?: string; avgRating?: number; reviewCount: number; stripeConnectReady: boolean };
  milestones: Milestone[];
  reviews: Review[];
}

function MilestoneStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING:   'text-gray-400 bg-gray-400/10',
    FUNDED:    'text-blue-400 bg-blue-400/10',
    SUBMITTED: 'text-yellow-400 bg-yellow-400/10',
    APPROVED:  'text-brand-green bg-brand-green/10',
    RELEASED:  'text-brand-green bg-brand-green/10',
    DISPUTED:  'text-red-400 bg-red-400/10',
    REFUNDED:  'text-gray-400 bg-gray-400/10',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${map[status] || 'text-gray-400 bg-gray-400/10'}`}>
      {status.toLowerCase()}
    </span>
  );
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} size={14} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
      ))}
    </div>
  );
}

const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSent, setReviewSent] = useState(false);

  const reload = () => {
    if (!id) return;
    API.getContract(id).then(setContract).catch(console.error);
  };

  useEffect(() => {
    if (!user || !id) { navigate('/auth'); return; }
    API.getContract(id)
      .then(setContract)
      .catch(() => setError('Contract not found'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const isClient = contract?.clientId === user?.id;
  const isFreelancer = contract?.freelancerId === user?.id;

  async function doAction(fn: () => Promise<any>, key: string) {
    setActionLoading(key);
    setError('');
    try { await fn(); reload(); }
    catch (e: any) { setError(e.message || 'Action failed'); }
    finally { setActionLoading(null); }
  }

  const hasReleased = contract?.milestones.some(m => m.status === 'RELEASED');
  const alreadyReviewed = contract?.reviews.some(r => r.reviewer.id === user?.id);

  async function submitReview() {
    if (!contract) return;
    setActionLoading('review');
    try {
      await API.submitReview(contract.id, reviewRating, reviewComment);
      setReviewSent(true);
      reload();
    } catch (e: any) {
      setError(e.message || 'Failed to submit review');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div className="min-h-screen bg-brand-black flex items-center justify-center text-gray-500">Loading…</div>;
  if (!contract) return <div className="min-h-screen bg-brand-black flex items-center justify-center text-gray-500">{error || 'Not found'}</div>;

  const other = isClient ? contract.freelancer : contract.client;

  return (
    <div className="relative min-h-screen">
      <SEO title={contract.title} canonical={`/contracts/${contract.id}`} description="Contract details" />
      <NeuralBackground parallax={false} />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <button onClick={() => navigate('/contracts')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to contracts
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
        )}

        {/* Header */}
        <div className="bg-brand-grey/70 border border-white/5 rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-black text-white mb-1">{contract.title}</h1>
              {contract.description && <p className="text-gray-400 text-sm">{contract.description}</p>}
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">€{contract.totalAmount.toFixed(2)}</p>
              <p className="text-gray-600 text-xs">total value</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {other.avatar ? (
              <img src={other.avatar} alt={other.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green font-black">
                {other.name[0]}
              </div>
            )}
            <div>
              <p className="text-white font-bold text-sm">{other.name}</p>
              {other.avgRating != null && (
                <div className="flex items-center gap-1 mt-0.5">
                  <StarRating rating={Math.round(other.avgRating)} />
                  <span className="text-gray-500 text-xs">{other.avgRating.toFixed(1)} ({other.reviewCount})</span>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/messages')}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all text-xs font-bold"
            >
              <MessageCircle size={13} /> Message
            </button>
          </div>
        </div>

        {/* Contract actions */}
        {contract.status === 'DRAFT' && isFreelancer && (
          <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-yellow-400 font-bold text-sm">Contract pending your acceptance</p>
              <p className="text-gray-500 text-xs mt-0.5">Review the milestones below, then accept to begin.</p>
            </div>
            <button
              onClick={() => doAction(() => API.acceptContract(contract.id), 'accept')}
              disabled={!!actionLoading}
              className="px-4 py-2 bg-brand-green text-brand-black font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
            >
              {actionLoading === 'accept' ? 'Accepting…' : 'Accept contract'}
            </button>
          </div>
        )}

        {/* Milestones */}
        <div className="bg-brand-grey/70 border border-white/5 rounded-2xl p-6 mb-4">
          <h2 className="text-white font-black mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-brand-green" /> Milestones
          </h2>
          <div className="space-y-3">
            {contract.milestones.map(m => (
              <div key={m.id} className="border border-white/5 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">{m.title}</p>
                    {m.description && <p className="text-gray-500 text-xs mt-0.5">{m.description}</p>}
                    {m.dueDate && <p className="text-gray-600 text-xs mt-1">Due {new Date(m.dueDate).toLocaleDateString()}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-white font-black">€{m.amount.toFixed(2)}</p>
                    <MilestoneStatusBadge status={m.status} />
                  </div>
                </div>
                {/* Milestone actions */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {isClient && m.status === 'PENDING' && contract.status === 'ACTIVE' && (
                    <button
                      onClick={() => doAction(() => API.fundMilestone(m.id), `fund-${m.id}`)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-all disabled:opacity-50"
                    >
                      <DollarSign size={12} />
                      {actionLoading === `fund-${m.id}` ? 'Funding…' : 'Fund milestone'}
                    </button>
                  )}
                  {isFreelancer && m.status === 'FUNDED' && (
                    <button
                      onClick={() => doAction(() => API.submitMilestone(m.id), `submit-${m.id}`)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded-lg text-xs font-bold hover:bg-yellow-400/20 transition-all disabled:opacity-50"
                    >
                      <Send size={12} />
                      {actionLoading === `submit-${m.id}` ? 'Submitting…' : 'Submit work'}
                    </button>
                  )}
                  {isClient && m.status === 'SUBMITTED' && (
                    <button
                      onClick={() => doAction(() => API.approveMilestone(m.id), `approve-${m.id}`)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 border border-brand-green/20 text-brand-green rounded-lg text-xs font-bold hover:bg-brand-green/20 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 size={12} />
                      {actionLoading === `approve-${m.id}` ? 'Approving…' : 'Approve & release payment'}
                    </button>
                  )}
                  {['FUNDED', 'SUBMITTED'].includes(m.status) && (
                    <button
                      onClick={() => doAction(() => API.disputeMilestone(m.id, 'Dispute raised'), `dispute-${m.id}`)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-400/10 border border-red-400/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-400/20 transition-all disabled:opacity-50"
                    >
                      <AlertTriangle size={12} />
                      Dispute
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review section */}
        {hasReleased && !alreadyReviewed && !reviewSent && (
          <div className="bg-brand-grey/70 border border-white/5 rounded-2xl p-6 mb-4">
            <h2 className="text-white font-black mb-4 flex items-center gap-2">
              <Star size={18} className="text-yellow-400" /> Leave a review
            </h2>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setReviewRating(n)}>
                  <Star size={28} className={n <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Share your experience (optional)"
              rows={3}
              className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none outline-none placeholder-gray-600 focus:border-brand-green/40 transition-colors mb-3"
            />
            <button
              onClick={submitReview}
              disabled={!!actionLoading}
              className="px-5 py-2.5 bg-brand-green text-brand-black font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
            >
              {actionLoading === 'review' ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        )}

        {/* Existing reviews */}
        {contract.reviews.length > 0 && (
          <div className="bg-brand-grey/70 border border-white/5 rounded-2xl p-6">
            <h2 className="text-white font-black mb-4">Reviews</h2>
            <div className="space-y-3">
              {contract.reviews.map(r => (
                <div key={r.id} className="border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {r.reviewer.avatar ? (
                      <img src={r.reviewer.avatar} alt={r.reviewer.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green font-black text-xs">{r.reviewer.name[0]}</div>
                    )}
                    <span className="text-white font-bold text-sm">{r.reviewer.name}</span>
                    <StarRating rating={r.rating} />
                  </div>
                  {r.comment && <p className="text-gray-400 text-sm">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel */}
        {['DRAFT', 'ACTIVE'].includes(contract.status) && (
          <div className="mt-4 text-center">
            <button
              onClick={() => { if (window.confirm('Cancel this contract?')) doAction(() => API.cancelContract(contract.id), 'cancel'); }}
              disabled={!!actionLoading}
              className="text-gray-600 hover:text-red-400 text-xs transition-colors"
            >
              Cancel contract
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractDetail;

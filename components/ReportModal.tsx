import React, { useState } from 'react';
import { X, Flag, AlertCircle } from 'lucide-react';
import { API } from '../lib/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'listing' | 'user' | 'post' | 'message';
  targetId: string;
}

const REASONS = [
  'Spam or misleading',
  'Inappropriate content',
  'Fraud or scam',
  'Harassment or abuse',
  'Intellectual property violation',
  'Other',
];

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, targetType, targetId }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) { setError('Please select a reason'); return; }
    setLoading(true);
    setError('');
    try {
      await API.submitReport({ targetType, targetRefId: targetId, reason, details: details || undefined });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDetails('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Flag size={16} className="text-red-400" />
            <h3 className="text-white font-bold">Report {targetType}</h3>
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <p className="text-brand-green font-bold mb-2">Report submitted</p>
            <p className="text-gray-500 text-sm">We'll review this and take appropriate action.</p>
            <button onClick={handleClose} className="mt-6 px-6 py-2 bg-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Reason</label>
              <div className="space-y-2">
                {REASONS.map(r => (
                  <label key={r} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                    reason === r ? 'border-brand-green bg-brand-green/5 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'
                  }`}>
                    <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${reason === r ? 'border-brand-green' : 'border-gray-600'}`}>
                      {reason === r && <div className="w-2 h-2 rounded-full bg-brand-green" />}
                    </div>
                    <span className="text-sm font-medium">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Details (optional)</label>
              <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} maxLength={1000}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-brand-green transition-colors resize-none"
                placeholder="Provide additional context..." />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;

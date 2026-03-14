
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, MapPin, Briefcase, ShieldCheck, MessageSquare,
  Clock, ArrowRight, User, ExternalLink, AlertCircle, Loader2
} from 'lucide-react';
import { API } from '../lib/api';
import NeuralBackground from '../components/NeuralBackground';

const FreelancerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      API.getProfile(id),
      API.getPortfolio(id),
    ])
      .then(([prof, port]) => {
        setProfile(prof);
        setPortfolio(port || []);
      })
      .catch(err => setError(err.message || 'Could not load profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-green" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle size={40} className="text-red-400" />
        <h2 className="text-2xl font-black text-white">Profile not found</h2>
        <p className="text-gray-500">{error || 'This freelancer profile does not exist.'}</p>
        <Link to="/marketplace" className="mt-4 px-6 py-3 bg-brand-green text-brand-black font-black rounded-xl text-sm">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isVerified = profile.kycVerified || profile.creatorStatus === 'approved' || profile.creatorStatus === 'APPROVED';

  return (
    <div className="relative min-h-screen pt-12 pb-24 px-4 overflow-hidden">
      <NeuralBackground parallax={false} />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Hero Card */}
        <div className="bg-brand-grey/60 border border-white/10 rounded-[3rem] p-10 md:p-14 mb-10 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-28 h-28 rounded-3xl border-2 border-brand-green/30 object-cover" />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-brand-grey border-2 border-brand-green/30 flex items-center justify-center text-brand-green">
                  <User size={40} />
                </div>
              )}
              {isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-green rounded-full flex items-center justify-center shadow-lg" title="Verified">
                  <ShieldCheck size={16} className="text-brand-black" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-white tracking-tighter">{profile.name}</h1>
                {isVerified && (
                  <span className="px-3 py-1 bg-brand-green/10 border border-brand-green/20 rounded-full text-[10px] font-black text-brand-green uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={10} /> Verified
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm font-medium capitalize mb-4">{profile.role || 'Freelancer'}</p>
              {profile.bio && (
                <p className="text-gray-300 leading-relaxed mb-6 max-w-xl">{profile.bio}</p>
              )}
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[11px] font-bold text-gray-400">{skill}</span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 shrink-0">
              <Link
                to="/messages"
                className="flex items-center gap-2 px-6 py-3 bg-brand-green text-brand-black font-black rounded-xl text-sm hover:scale-105 transition-all"
              >
                <MessageSquare size={16} /> Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Portfolio */}
          <div className="lg:col-span-2">
            {portfolio.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-6">Portfolio</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {portfolio.map((item: any) => (
                    <div key={item.id} className="bg-brand-grey/40 border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-colors">
                      {(item.imageUrl || item.fileType?.startsWith('image/')) && (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                        {item.description && <p className="text-gray-500 text-xs">{item.description}</p>}
                        {item.fileUrl && (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-brand-green text-[11px] font-bold mt-3 hover:underline"
                          >
                            View file <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {portfolio.length === 0 && (
              <div className="mb-10 bg-brand-grey/40 border border-white/5 rounded-2xl p-10 text-center">
                <Briefcase size={28} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-600 text-sm font-bold">No portfolio items yet</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-brand-grey/40 border border-white/5 rounded-2xl p-6">
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-5">Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-gray-600 shrink-0" />
                  <span className="text-gray-400">Member since <span className="text-white font-bold">{profile.createdAt ? new Date(profile.createdAt).getFullYear() : '—'}</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck size={16} className={isVerified ? 'text-brand-green shrink-0' : 'text-gray-600 shrink-0'} />
                  <span className="text-gray-400">
                    KYC Status: <span className={`font-bold ${isVerified ? 'text-brand-green' : 'text-yellow-400'}`}>{isVerified ? 'Verified' : 'Pending'}</span>
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/marketplace"
              className="block w-full py-4 bg-brand-grey/40 border border-white/5 rounded-2xl text-center text-xs font-black text-gray-400 hover:text-white hover:border-white/10 transition-colors"
            >
              Browse More Freelancers <ArrowRight size={12} className="inline ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;

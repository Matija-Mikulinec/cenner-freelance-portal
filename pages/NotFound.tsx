import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-[120px] font-black text-white/10 leading-none select-none">404</h1>
    <h2 className="text-2xl font-bold text-white -mt-4 mb-3">Page not found</h2>
    <p className="text-gray-500 mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
    <div className="flex gap-4">
      <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-brand-green text-brand-black font-bold rounded-xl hover:scale-105 transition-all">
        <Home size={16} /> Go Home
      </Link>
      <button onClick={() => window.history.back()} className="flex items-center gap-2 px-6 py-3 border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all">
        <ArrowLeft size={16} /> Go Back
      </button>
    </div>
  </div>
);

export default NotFound;

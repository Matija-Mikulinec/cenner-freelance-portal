
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut, Globe, ChevronDown, Briefcase, MessageSquare } from 'lucide-react';
import PermissionModal from './PermissionModal';
import ChatWidget from './ChatWidget';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const LANGUAGES = [
  { code: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'HR', flag: '🇭🇷', name: 'Hrvatski' },
  { code: 'DE', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'ES', flag: '🇪🇸', name: 'Español' },
  { code: 'IT', flag: '🇮🇹', name: 'Italiano' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen]         = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isLangOpen, setIsLangOpen]         = useState(false);
  const [isAboutOpen, setIsAboutOpen]       = useState(false);
  const [isMarketOpen, setIsMarketOpen]     = useState(false);
  const [selectedLang, setSelectedLang]     = useState(() => localStorage.getItem('cenner_lang') || 'EN');
  const { user, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const langRef    = useRef<HTMLDivElement>(null);
  const aboutRef   = useRef<HTMLDivElement>(null);
  const marketRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current   && !langRef.current.contains(e.target as Node))   setIsLangOpen(false);
      if (aboutRef.current  && !aboutRef.current.contains(e.target as Node))  setIsAboutOpen(false);
      if (marketRef.current && !marketRef.current.contains(e.target as Node)) setIsMarketOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => { logout(); navigate('/'); };
  const handleLangSelect = (code: string) => {
    setSelectedLang(code);
    localStorage.setItem('cenner_lang', code);
    setIsLangOpen(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0];

  // Plain top-level links (no dropdown)
  const navLinks = [
    { name: 'Services',  path: '/services' },
    { name: 'Pricing',   path: '/subscription' },
    { name: 'Blog',      path: '/blog' },
    { name: 'Contact',   path: '/contact' },
  ];

  const marketDropdownItems = [
    { label: 'Marketplace', path: '/marketplace', desc: 'Browse all freelancer listings' },
    { label: 'Job Matching', path: '/match',       desc: 'Find jobs that match your skills' },
  ];

  const aboutDropdownItems = [
    { label: 'About Us',          path: '/about',       desc: 'Our mission & story' },
    { label: 'Previous Projects', path: '/projects',    desc: "Work we've delivered" },
    { label: 'Technology',        path: '/technology',  desc: 'The stack powering Cenner' },
  ];

  const isMarketActive = ['/marketplace', '/match'].includes(location.pathname);
  const isAboutActive  = ['/about', '/projects', '/technology'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-300 bg-brand-black text-white">
      <PermissionModal isOpen={isPermissionModalOpen} onClose={() => setIsPermissionModalOpen(false)} />
      <ChatWidget />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-brand-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-green to-brand-pink rounded-xl flex items-center justify-center font-black text-brand-black group-hover:rotate-12 transition-transform">C</div>
              <span className="text-2xl font-black tracking-tighter text-white">CENNER</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">

              {/* Marketplace Dropdown */}
              <div ref={marketRef} className="relative">
                <button
                  onClick={() => setIsMarketOpen(v => !v)}
                  className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:text-brand-green ${isMarketActive ? 'text-brand-green' : 'text-gray-400'}`}
                >
                  Marketplace
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isMarketOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMarketOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-brand-grey border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {marketDropdownItems.map(item => (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setIsMarketOpen(false)}
                        className="block px-5 py-3.5 hover:bg-white/5 transition-colors group/item"
                      >
                        <div className="text-xs font-bold text-white group-hover/item:text-brand-green transition-colors">{item.label}</div>
                        <div className="text-[10px] text-gray-600 mt-0.5">{item.desc}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Plain links */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:text-brand-green ${location.pathname === link.path ? 'text-brand-green' : 'text-gray-400'}`}
                >
                  {link.name}
                </Link>
              ))}

              {/* About Dropdown */}
              <div ref={aboutRef} className="relative">
                <button
                  onClick={() => setIsAboutOpen(v => !v)}
                  className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:text-brand-green ${isAboutActive ? 'text-brand-green' : 'text-gray-400'}`}
                >
                  About
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isAboutOpen ? 'rotate-180' : ''}`} />
                </button>
                {isAboutOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-brand-grey border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {aboutDropdownItems.map(item => (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setIsAboutOpen(false)}
                        className="block px-5 py-3.5 hover:bg-white/5 transition-colors group/about"
                      >
                        <div className="text-xs font-bold text-white group-hover/about:text-brand-green transition-colors">{item.label}</div>
                        <div className="text-[10px] text-gray-600 mt-0.5">{item.desc}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-white/10 mx-2" />

              {user ? (
                <div className="flex items-center space-x-5 pl-4">
                  <Link to="/dashboard" className="flex items-center space-x-4 group/profile">
                    <div className="text-right">
                      <p className="text-[9px] font-black text-brand-green uppercase tracking-widest leading-none mb-1">Elite Node</p>
                      <p className="text-xs font-bold text-white group-hover/profile:text-brand-pink transition-colors">{user.name || 'Freelancer'}</p>
                    </div>
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-brand-green p-0.5 group-hover/profile:scale-110 transition-transform" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-grey border-2 border-brand-green flex items-center justify-center text-brand-green group-hover/profile:scale-110 transition-transform">
                        <UserIcon size={20} />
                      </div>
                    )}
                  </Link>
                  <Link to="/messages" className="p-2 text-gray-500 hover:text-brand-green transition-colors" title="Messages">
                    <MessageSquare size={20} />
                  </Link>
                  <Link to="/orders" className="p-2 text-gray-500 hover:text-brand-green transition-colors" title="Orders">
                    <Briefcase size={20} />
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-brand-pink transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="px-8 py-3 rounded-xl bg-white text-brand-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                  Login / Signup
                </Link>
              )}

              {/* Language Selector */}
              <div ref={langRef} className="relative">
                <button
                  onClick={() => setIsLangOpen(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-colors text-gray-400 hover:text-white"
                >
                  <span className="text-base leading-none">{currentLang.flag}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{currentLang.code}</span>
                  <ChevronDown size={10} className={`transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-3 w-40 bg-brand-grey border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangSelect(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${selectedLang === lang.code ? 'text-brand-green' : 'text-gray-300'}`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest">{lang.code}</div>
                          <div className="text-[10px] text-gray-600">{lang.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center gap-3">
              <div ref={langRef} className="relative">
                <button
                  onClick={() => setIsLangOpen(v => !v)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-gray-400"
                >
                  <span className="text-sm">{currentLang.flag}</span>
                  <span className="text-[10px] font-black">{currentLang.code}</span>
                </button>
                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-2 w-36 bg-brand-grey border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    {LANGUAGES.map(lang => (
                      <button key={lang.code} onClick={() => handleLangSelect(lang.code)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/5 ${selectedLang === lang.code ? 'text-brand-green' : 'text-gray-300'}`}>
                        <span>{lang.flag}</span>
                        <span className="text-[10px] font-bold">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-brand-black border-b border-white/10 pb-8 px-6 space-y-1">
            {/* Marketplace group */}
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 pt-5 pb-1">Marketplace</p>
            {marketDropdownItems.map(item => (
              <Link key={item.label} to={item.path} onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-bold text-white border-b border-white/5 pl-2">{item.label}</Link>
            ))}
            {/* Plain links */}
            {navLinks.map(link => (
              <Link key={link.name} to={link.path} onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg font-bold text-white border-b border-white/5">{link.name}</Link>
            ))}
            {/* About group */}
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 pt-4 pb-1">Company</p>
            {aboutDropdownItems.map(item => (
              <Link key={item.label} to={item.path} onClick={() => setIsMenuOpen(false)} className="block py-2.5 text-base font-semibold text-gray-300 pl-2">{item.label}</Link>
            ))}
            {/* User links */}
            <div className="pt-3 border-t border-white/5">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg font-bold text-brand-green">Dashboard</Link>
                  <Link to="/messages"  onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg font-bold text-white">Messages</Link>
                  <Link to="/orders"    onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg font-bold text-white">Orders</Link>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg font-bold text-brand-pink">Login / Signup</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

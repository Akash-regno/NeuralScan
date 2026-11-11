import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GitMerge } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <header className="sticky top-0 z-50 w-full pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Floating Glassmorphic Pill Capsule matching React Bits style */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-2.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {/* Logo & Brand with Atomic/Consensus Icon */}
          <Link
            to="/"
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform">
              <svg
                className="w-6 h-6 text-red-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="2.5" />
                <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(30 12 12)" />
                <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(-30 12 12)" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">
                NeuralScan
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/models"
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname === '/models'
                  ? 'text-red-400 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GitMerge className="w-3.5 h-3.5 text-red-400" />
              <span>Model Laboratory</span>
            </Link>

            <Link
              to="/metrics"
              className={`text-sm font-medium transition-colors ${
                pathname === '/metrics'
                  ? 'text-red-400 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Metrics
            </Link>

            <Link
              to="/about"
              className={`text-sm font-medium transition-colors ${
                pathname === '/about'
                  ? 'text-red-400 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              About
            </Link>

            {/* Prominent Consensus Action Button */}
            <Link
              to="/analyze"
              className="bg-white text-black font-semibold text-sm px-5 py-2 rounded-full hover:bg-slate-200 active:scale-95 transition-all shadow-md ml-1 cursor-pointer"
            >
              Analyze
            </Link>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Container */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 rounded-3xl bg-black/90 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === '/'
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>
            <Link
              to="/models"
              onClick={() => setMobileMenuOpen(false)}
              className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === '/models'
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Model Laboratory
            </Link>
            <Link
              to="/metrics"
              onClick={() => setMobileMenuOpen(false)}
              className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === '/metrics'
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Model Metrics
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === '/about'
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              About
            </Link>
            <div className="pt-2">
              <Link
                to="/analyze"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full bg-white text-black font-semibold text-sm py-2.5 rounded-full hover:bg-slate-200 transition-all text-center shadow-md cursor-pointer"
              >
                Analyze
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

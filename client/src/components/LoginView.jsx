import React, { useState } from 'react';
import { apiRequest, setAuthToken, setCurrentUser } from '../services/api';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';

export default function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (data.token) {
        setAuthToken(data.token);
        setCurrentUser(data.user);
        onLoginSuccess();
      } else {
        setError('Access Denied - Invalid Username or Password');
      }
    } catch (err) {
      setError(err.message || 'Access Denied - Invalid Username or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#07080A] px-4 overflow-hidden select-none">
      {/* Background Decorative Market Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00E676]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#00E5FF]/10 blur-[130px] pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#1E2330 1px, transparent 1px), linear-gradient(90deg, #1E2330 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Card */}
        <div className="bg-[#0E1015]/90 border border-[#1E2330] rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 mb-4 shadow-lg shadow-[#00E676]/10">
              <TrendingUp className="w-8 h-8 text-[#00E676]" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
              <span>DUO</span>
              <span className="text-[#00E676] glow-text-green">ALPHA</span>
            </h1>
            <p className="mt-1 text-xs font-mono uppercase tracking-[0.25em] text-[#00E5FF]">
              Trade Together. Grow Together.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-gray-400 bg-white/5 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
              Private Team Portal
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-400">{error}</p>
                <p className="text-[11px] text-red-300/70 mt-0.5">Please check credentials or contact team admin.</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter authorized username"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141822] border border-[#1E2330] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141822] border border-[#1E2330] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm tracking-wide bg-gradient-to-r from-[#00E676] to-[#00E5FF] text-black hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Enter DuoAlpha Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-[#1E2330] text-center">
            <p className="text-[11px] text-gray-500 font-mono">
              Restricted Access. Institutional 256-Bit Cryptographic Vault.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

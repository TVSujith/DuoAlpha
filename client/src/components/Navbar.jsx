import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  BarChart3,
  FileSpreadsheet,
  MessageSquare,
  Settings,
  LogOut,
  AlertTriangle,
  Radio,
  UserCheck
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onLogout,
  unreadCount,
  dailyLossBreached,
  activeSpeaker,
  setActiveSpeaker,
  partnerNames,
  onlineCount
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trades', label: 'Trades', icon: TrendingUp },
    { id: 'capital', label: 'Capital', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    {
      id: 'alpha-room',
      label: 'Alpha Room',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : null
    },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E2330] bg-[#07080A]/90 backdrop-blur-xl">
      {/* Top Risk Warning Strip if Limit Breached */}
      {dailyLossBreached && (
        <div className="w-full bg-red-600/20 border-b border-red-500/40 px-4 py-2 flex items-center justify-center gap-2 text-red-400 font-mono text-xs tracking-wider animate-pulse">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span className="font-bold">CRITICAL RISK ALERT:</span>
          <span>Daily Loss Limit Reached! Protect capital and halt further trades today.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E676] to-[#00E5FF] p-0.5 shadow-lg shadow-[#00E676]/20">
              <div className="w-full h-full bg-[#07080A] rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#00E676]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-sans">
                  DUO<span className="text-[#00E676]">ALPHA</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 hidden sm:block">
                Trade Together. Grow Together.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#141822] text-[#00E676] border border-[#00E676]/40 shadow-sm shadow-[#00E676]/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00E676]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#00E676] text-black font-bold animate-bounce">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Utilities: Active Speaker & Logout */}
          <div className="flex items-center gap-3">
            {/* Active Partner Persona Switcher */}
            <div className="hidden lg:flex items-center bg-[#141822] border border-[#1E2330] rounded-xl p-1 text-xs font-mono">
              <span className="text-gray-500 px-2 flex items-center gap-1 text-[11px]">
                <UserCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                Active:
              </span>
              <button
                onClick={() => setActiveSpeaker(partnerNames.partner1 || 'Sujith')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeSpeaker === (partnerNames.partner1 || 'Sujith')
                    ? 'bg-[#00E676] text-black font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {partnerNames.partner1 || 'Sujith'}
              </button>
              <button
                onClick={() => setActiveSpeaker(partnerNames.partner2 || 'Bhuvana')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeSpeaker === (partnerNames.partner2 || 'Bhuvana')
                    ? 'bg-[#00E5FF] text-black font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {partnerNames.partner2 || 'Bhuvana'}
              </button>
            </div>

            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141822] border border-[#1E2330] text-[11px] font-mono text-gray-400">
              <Radio className="w-3 h-3 text-[#00E676] animate-pulse" />
              <span>{onlineCount || 1} Online</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Logout session"
              className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Scroll Strip */}
      <div className="md:hidden border-t border-[#1E2330] px-2 py-2 overflow-x-auto flex items-center gap-1 bg-[#0A0C10]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#141822] text-[#00E676] border border-[#00E676]/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1 rounded-full text-[9px] bg-[#00E676] text-black font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Activity,
  Award
} from 'lucide-react';

export default function DashboardView({
  dashboardData,
  onOpenAddTrade,
  onOpenCapitalModal,
  onNavigateTab
}) {
  const { capital, pnl, risk, goal, metrics, recentTrades } = dashboardData || {
    capital: { currentCapital: 0, totalDeposited: 0, totalWithdrawn: 0 },
    pnl: { totalProfit: 0, totalLoss: 0, netPnL: 0, todayPnL: 0, monthlyPnL: 0 },
    risk: { maxDailyLossLimit: 5000, dailyLossBreached: false },
    goal: { monthlyGoal: 50000, monthlyGoalProgress: 0 },
    metrics: { winningDaysCount: 0, losingDaysCount: 0, winRate: 0, bestDay: null, worstDay: null },
    recentTrades: []
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return (num < 0 ? '-₹' : '₹') + Math.abs(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0E1015] via-[#141822] to-[#0E1015] border border-[#1E2330] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-ping" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#00E676]">
              Alpha Trading Terminal Active
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            DuoAlpha Master Command
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Live collaborative capital deployment and equity performance tracking.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={onOpenAddTrade}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide bg-[#00E676] text-black hover:bg-[#00E676]/90 active:scale-95 transition-all shadow-lg shadow-[#00E676]/20 font-mono"
          >
            <PlusCircle className="w-4 h-4" />
            RECORD TRADE
          </button>
          <button
            onClick={onOpenCapitalModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide bg-[#141822] text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF]/10 active:scale-95 transition-all font-mono"
          >
            <Wallet className="w-4 h-4" />
            MANAGE CAPITAL
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid (Animated Glow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Current Capital */}
        <div className="p-5 rounded-2xl bg-[#0E1015] border border-[#1E2330] hover:border-[#00E5FF]/50 transition-all duration-300 relative group overflow-hidden shadow-card">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E5FF]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Current Capital</span>
            <Wallet className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {formatCurrency(capital.currentCapital)}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-white/5">
            <span>Deposited: {formatCurrency(capital.totalDeposited)}</span>
            <span>Withdrawn: {formatCurrency(capital.totalWithdrawn)}</span>
          </div>
        </div>

        {/* Net P&L */}
        <div className={`p-5 rounded-2xl bg-[#0E1015] border transition-all duration-300 relative group overflow-hidden shadow-card ${
          pnl.netPnL >= 0
            ? 'border-[#00E676]/30 hover:border-[#00E676] glow-border-green'
            : 'border-red-500/30 hover:border-red-500 shadow-glow-red'
        }`}>
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Net Overall P&L</span>
            {pnl.netPnL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[#00E676]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className={`text-3xl font-black font-mono tracking-tight ${
            pnl.netPnL >= 0 ? 'text-[#00E676] glow-text-green' : 'text-red-500'
          }`}>
            {formatCurrency(pnl.netPnL)}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-white/5">
            <span className="text-[#00E676]">Gross Win: +{formatCurrency(pnl.totalProfit)}</span>
            <span className="text-red-400">Gross Loss: -{formatCurrency(pnl.totalLoss)}</span>
          </div>
        </div>

        {/* Today's P&L */}
        <div className={`p-5 rounded-2xl bg-[#0E1015] border transition-all duration-300 relative group overflow-hidden shadow-card ${
          pnl.todayPnL >= 0 ? 'border-[#1E2330] hover:border-[#00E676]/50' : 'border-red-500/40 hover:border-red-500'
        }`}>
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Today's P&L</span>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <div className={`text-3xl font-black font-mono tracking-tight flex items-center gap-2 ${
            pnl.todayPnL > 0 ? 'text-[#00E676]' : pnl.todayPnL < 0 ? 'text-red-500' : 'text-white'
          }`}>
            {pnl.todayPnL > 0 && <ArrowUpRight className="w-6 h-6 shrink-0" />}
            {pnl.todayPnL < 0 && <ArrowDownRight className="w-6 h-6 shrink-0" />}
            <span>{formatCurrency(pnl.todayPnL)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-white/5">
            <span>Status: {pnl.todayPnL >= 0 ? 'In Profit' : 'In Drawdown'}</span>
            <span className="font-mono text-gray-300">
              Limit: {formatCurrency(risk.maxDailyLossLimit)}
            </span>
          </div>
        </div>

        {/* Monthly P&L */}
        <div className="p-5 rounded-2xl bg-[#0E1015] border border-[#1E2330] hover:border-[#00E676]/50 transition-all duration-300 relative group overflow-hidden shadow-card">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Monthly P&L</span>
            <Activity className="w-4 h-4 text-[#00E676]" />
          </div>
          <div className={`text-3xl font-black font-mono tracking-tight ${
            pnl.monthlyPnL >= 0 ? 'text-[#00E676]' : 'text-red-500'
          }`}>
            {formatCurrency(pnl.monthlyPnL)}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-white/5">
            <span>Goal: {formatCurrency(goal.monthlyGoal)}</span>
            <span className="text-[#00E676] font-mono">{goal.monthlyGoalProgress}% done</span>
          </div>
        </div>

        {/* Total Profit */}
        <div className="p-5 rounded-2xl bg-[#0E1015] border border-[#1E2330] hover:border-[#00E676]/40 transition-all duration-300 shadow-card">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Total Gross Profit</span>
            <ArrowUpRight className="w-4 h-4 text-[#00E676]" />
          </div>
          <div className="text-3xl font-black text-[#00E676] font-mono tracking-tight">
            +{formatCurrency(pnl.totalProfit)}
          </div>
          <div className="mt-3 text-[11px] text-gray-400 pt-3 border-t border-white/5 flex items-center justify-between">
            <span>Winning Days: {metrics.winningDaysCount}</span>
            <span className="font-mono text-[#00E676]">Win Rate: {metrics.winRate}%</span>
          </div>
        </div>

        {/* Total Loss */}
        <div className="p-5 rounded-2xl bg-[#0E1015] border border-[#1E2330] hover:border-red-500/40 transition-all duration-300 shadow-card">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Total Gross Loss</span>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-black text-red-500 font-mono tracking-tight">
            -{formatCurrency(pnl.totalLoss)}
          </div>
          <div className="mt-3 text-[11px] text-gray-400 pt-3 border-t border-white/5 flex items-center justify-between">
            <span>Losing Days: {metrics.losingDaysCount}</span>
            <span className="font-mono text-gray-300">Total Trades: {metrics.totalTrades}</span>
          </div>
        </div>
      </div>

      {/* Goal & Risk Management Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Profit Goal Card */}
        <div className="p-6 rounded-2xl bg-[#0E1015] border border-[#1E2330] space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#00E676]/10 text-[#00E676]">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Monthly Profit Goal
                </h3>
                <p className="text-xs text-gray-400">Team milestone target</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black font-mono text-[#00E676]">
                {goal.monthlyGoalProgress}%
              </span>
              <p className="text-[10px] text-gray-500 uppercase font-mono">Completed</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 rounded-full bg-[#141822] overflow-hidden border border-[#1E2330] p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00E676] to-[#00E5FF] transition-all duration-700 shadow-lg shadow-[#00E676]/30"
                style={{ width: `${Math.min(goal.monthlyGoalProgress, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span>Current: {formatCurrency(pnl.monthlyPnL)}</span>
              <span>Target: {formatCurrency(goal.monthlyGoal)}</span>
            </div>
          </div>
        </div>

        {/* Risk Management & Daily Loss Limit Card */}
        <div className={`p-6 rounded-2xl bg-[#0E1015] border space-y-4 shadow-card transition-all ${
          risk.dailyLossBreached
            ? 'border-red-500/80 bg-red-950/20 shadow-glow-red'
            : 'border-[#1E2330]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${risk.dailyLossBreached ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-400'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Risk Management
                </h3>
                <p className="text-xs text-gray-400">Daily Max Loss Threshold</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-sm font-bold font-mono px-2.5 py-1 rounded-lg border ${
                risk.dailyLossBreached
                  ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {risk.dailyLossBreached ? 'LIMIT BREACHED' : 'CAPITAL SECURE'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">Today's Drawdown:</span>
              <span className={pnl.todayPnL < 0 ? 'text-red-400 font-bold' : 'text-gray-300'}>
                {pnl.todayPnL < 0 ? `-${formatCurrency(Math.abs(pnl.todayPnL))}` : '₹0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">Allowed Max Daily Loss:</span>
              <span className="text-white font-bold">{formatCurrency(risk.maxDailyLossLimit)}</span>
            </div>
            {risk.dailyLossBreached && (
              <p className="text-xs font-bold text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/30 mt-2">
                ⚠️ Daily Loss Limit Reached! Further trade executions are restricted to protect principal capital.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Trades Table Preview */}
      <div className="rounded-2xl bg-[#0E1015] border border-[#1E2330] p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Recent Trade Activity
            </h3>
            <p className="text-xs text-gray-400">Latest executed executions</p>
          </div>
          <button
            onClick={() => onNavigateTab('trades')}
            className="text-xs font-mono text-[#00E5FF] hover:underline flex items-center gap-1"
          >
            VIEW ALL TRADES →
          </button>
        </div>

        {recentTrades.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs font-mono">
            No trade entries recorded yet. Click "RECORD TRADE" to add the first position!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1E2330] text-gray-500 uppercase">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2330]/60">
                {recentTrades.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-gray-300">{t.date}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.amount >= 0
                          ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {t.amount >= 0 ? 'PROFIT' : 'LOSS'}
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-bold ${
                      t.amount >= 0 ? 'text-[#00E676]' : 'text-red-400'
                    }`}>
                      {t.amount >= 0 ? '+' : ''}{formatCurrency(t.amount)}
                    </td>
                    <td className="py-3 px-3 text-gray-400 max-w-xs truncate">
                      {t.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

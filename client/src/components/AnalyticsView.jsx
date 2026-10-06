import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  AlertOctagon,
  Percent,
  Calendar,
  Layers
} from 'lucide-react';

export default function AnalyticsView({ stats, capitalSummary }) {
  const [activeChart, setActiveChart] = useState('daily'); // 'daily' | 'monthly' | 'growth'

  const {
    winningDaysCount = 0,
    losingDaysCount = 0,
    breakEvenDaysCount = 0,
    winRate = 0,
    bestDay = null,
    worstDay = null,
    equityCurve = [],
    dailyMap = {},
    monthlyMap = {}
  } = stats || {};

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return (num < 0 ? '-₹' : '₹') + Math.abs(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Convert dailyMap into array for chart
  const dailyArray = Object.entries(dailyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, amount]) => ({ date, amount }));

  // Convert monthlyMap into array for chart
  const monthlyArray = Object.entries(monthlyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, amount]) => ({ month, amount }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00E676]" />
          Trading Analytics & Performance
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Quant metrics, win-rate attribution, and capital equity expansion.
        </p>
      </div>

      {/* KPI Cards: Best / Worst / Win rate / Winning vs Losing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Win Rate */}
        <div className="p-5 rounded-2xl bg-[#0E1015] border border-[#1E2330] shadow-card">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-gray-400 mb-1">
            <span>Win Rate</span>
            <Percent className="w-4 h-4 text-[#00E676]" />
          </div>
          <div className="text-3xl font-black text-[#00E676] font-mono tracking-tight glow-text-green">
            {winRate}%
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-mono">
            {winningDaysCount} Wins / {losingDaysCount} Losses
          </p>
        </div>

        {/* Best Trading Day */}
        <div className="p-5 rounded-2xl bg-[#0E1015] border border-[#1E2330] shadow-card">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-gray-400 mb-1">
            <span>Best Trading Day</span>
            <Award className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="text-2xl font-black text-[#00E676] font-mono tracking-tight">
            {bestDay ? `+${formatCurrency(bestDay.amount)}` : '₹0.00'}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-mono">
            {bestDay ? bestDay.date : 'No trades recorded'}
          </p>
        </div>

        {/* Worst Trading Day */}
        <div className="p-5 rounded-2xl bg-[#0E1015] border border-[#1E2330] shadow-card">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-gray-400 mb-1">
            <span>Worst Trading Day</span>
            <AlertOctagon className="w-4 h-4 text-[#FF4560]" />
          </div>
          <div className="text-2xl font-black text-[#FF4560] font-mono tracking-tight">
            {worstDay ? formatCurrency(worstDay.amount) : '₹0.00'}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-mono">
            {worstDay ? worstDay.date : 'No drawdown recorded'}
          </p>
        </div>

        {/* Day Counts */}
        <div className="p-5 rounded-2xl bg-[#0E1015] border border-[#1E2330] shadow-card">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-gray-400 mb-1">
            <span>Session Stats</span>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {winningDaysCount + losingDaysCount + breakEvenDaysCount} Days
          </div>
          <div className="text-[11px] text-gray-400 mt-2 font-mono flex items-center justify-between">
            <span className="text-[#00E676]">Green: {winningDaysCount}</span>
            <span className="text-[#FF4560]">Red: {losingDaysCount}</span>
          </div>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="rounded-2xl bg-[#0E1015] border border-[#1E2330] p-6 shadow-card">
        {/* Chart Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2330] pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white uppercase font-mono tracking-wider">
              {activeChart === 'daily' && 'Daily Profit & Loss Graph'}
              {activeChart === 'monthly' && 'Monthly Profit & Loss Graph'}
              {activeChart === 'growth' && 'Capital Growth Curve (Equity)'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Visualizing performance across historical trading horizons
            </p>
          </div>

          <div className="flex items-center bg-[#141822] border border-[#1E2330] rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setActiveChart('daily')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeChart === 'daily' ? 'bg-[#00E676] text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Daily P&L
            </button>
            <button
              onClick={() => setActiveChart('monthly')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeChart === 'monthly' ? 'bg-[#00E676] text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly P&L
            </button>
            <button
              onClick={() => setActiveChart('growth')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeChart === 'growth' ? 'bg-[#00E5FF] text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Capital Growth
            </button>
          </div>
        </div>

        {/* 1. Daily P&L Chart */}
        {activeChart === 'daily' && (
          <div className="space-y-4">
            {dailyArray.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs font-mono text-gray-500">
                No daily trading activity to chart yet.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-72 w-full flex items-end gap-2 pt-6 pb-2 overflow-x-auto border-b border-[#1E2330]">
                  {(() => {
                    const maxAbs = Math.max(
                      ...dailyArray.map((d) => Math.abs(d.amount)),
                      1
                    );
                    return dailyArray.map((d) => {
                      const isProfit = d.amount >= 0;
                      const barHeight = Math.max(
                        (Math.abs(d.amount) / maxAbs) * 100,
                        6
                      );
                      return (
                        <div
                          key={d.date}
                          className="flex flex-col items-center flex-1 min-w-[36px] max-w-[50px] group relative"
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-[#1E2330] rounded px-2 py-1 text-[10px] font-mono whitespace-nowrap z-20 pointer-events-none">
                            <div className="text-gray-400">{d.date}</div>
                            <div className={isProfit ? 'text-[#00E676]' : 'text-red-400'}>
                              {isProfit ? '+' : ''}{formatCurrency(d.amount)}
                            </div>
                          </div>

                          {/* Bar */}
                          <div className="h-44 w-full flex items-center justify-center relative">
                            {/* Zero line */}
                            <div className="absolute inset-x-0 h-px bg-gray-700/50" />
                            <div
                              style={{ height: `${barHeight}%` }}
                              className={`w-full rounded-t transition-all ${
                                isProfit
                                  ? 'bg-[#00E676] shadow-sm shadow-[#00E676]/30'
                                  : 'bg-[#FF4560] shadow-sm shadow-[#FF4560]/30'
                              }`}
                            />
                          </div>

                          {/* Date Label */}
                          <div className="mt-2 text-[10px] text-gray-400 truncate w-full text-center font-mono">
                            {d.date.substring(5)}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Monthly P&L Chart */}
        {activeChart === 'monthly' && (
          <div className="space-y-4">
            {monthlyArray.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs font-mono text-gray-500">
                No monthly data recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {monthlyArray.map((m) => {
                  const isProfit = m.amount >= 0;
                  return (
                    <div
                      key={m.month}
                      className="p-4 rounded-xl bg-[#141822] border border-[#1E2330] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-[#00E5FF]" />
                        <div>
                          <div className="text-sm font-bold text-white font-mono">{m.month}</div>
                          <div className="text-xs text-gray-400">Monthly P&L Aggregate</div>
                        </div>
                      </div>

                      <div className={`text-lg font-black font-mono ${
                        isProfit ? 'text-[#00E676]' : 'text-[#FF4560]'
                      }`}>
                        {isProfit ? '+' : ''}{formatCurrency(m.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. Capital Growth Graph (Equity Curve) */}
        {activeChart === 'growth' && (
          <div className="space-y-4">
            {equityCurve.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs font-mono text-gray-500">
                No trade milestones available to construct equity trajectory.
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-2">
                  <span>Initial Capital: {formatCurrency(equityCurve[0]?.equity - equityCurve[0]?.dayPnL)}</span>
                  <span className="text-[#00E5FF] font-bold">
                    Latest Equity: {formatCurrency(equityCurve[equityCurve.length - 1]?.equity)}
                  </span>
                </div>

                {/* SVG Line / Area Graph */}
                <div className="w-full h-64 bg-[#141822] rounded-xl border border-[#1E2330] p-4 relative overflow-hidden flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#00E676" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {(() => {
                      const equities = equityCurve.map((e) => e.equity);
                      const minEq = Math.min(...equities) * 0.95;
                      const maxEq = Math.max(...equities) * 1.05;
                      const range = maxEq - minEq || 1;

                      const pts = equityCurve.map((e, idx) => {
                        const x = (idx / (equityCurve.length - 1 || 1)) * 500;
                        const y = 200 - ((e.equity - minEq) / range) * 180 - 10;
                        return `${x},${y}`;
                      });

                      const pathD = `M 0,200 L ${pts[0]} ` + pts.slice(1).map(p => `L ${p}`).join(' ') + ` L 500,200 Z`;
                      const lineD = `M ${pts[0]} ` + pts.slice(1).map(p => `L ${p}`).join(' ');

                      return (
                        <>
                          <path d={pathD} fill="url(#equityGrad)" />
                          <path d={lineD} fill="none" stroke="#00E5FF" strokeWidth="3" />
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

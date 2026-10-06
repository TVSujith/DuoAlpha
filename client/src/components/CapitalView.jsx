import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Minus,
  X,
  History,
  DollarSign
} from 'lucide-react';

export default function CapitalView({
  capitalData,
  onAddCapitalTransaction
}) {
  const { currentCapital, totalDeposited, totalWithdrawn, netTradingPnL, transactions } =
    capitalData || {
      currentCapital: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      netTradingPnL: 0,
      transactions: []
    };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txType, setTxType] = useState('deposit'); // 'deposit' | 'withdrawal'
  const [txAmount, setTxAmount] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const openModal = (type) => {
    setTxType(type);
    setTxAmount('');
    setTxNotes('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amt = parseFloat(txAmount.replace(/,/g, ''));
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid positive capital amount');
      return;
    }

    if (txType === 'withdrawal' && amt > currentCapital) {
      setError(`Cannot withdraw ₹${amt.toLocaleString('en-IN')}. Available capital: ₹${currentCapital.toLocaleString('en-IN')}`);
      return;
    }

    try {
      await onAddCapitalTransaction({
        type: txType,
        amount: amt,
        notes: txNotes,
        date: txDate
      });
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || 'Transaction failed');
    }
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
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#00E5FF]" />
            Capital Management
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time capital balance calculated dynamically from funding events and trading returns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('deposit')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wider bg-[#00E676] text-black hover:bg-[#00E676]/90 active:scale-95 transition-all shadow-lg shadow-[#00E676]/20 font-mono"
          >
            <Plus className="w-4 h-4" />
            DEPOSIT FUNDS
          </button>
          <button
            onClick={() => openModal('withdrawal')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wider bg-[#141822] text-[#FF4560] border border-[#FF4560]/30 hover:bg-[#FF4560]/10 active:scale-95 transition-all font-mono"
          >
            <Minus className="w-4 h-4" />
            WITHDRAW FUNDS
          </button>
        </div>
      </div>

      {/* Capital Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Current Capital */}
        <div className="p-5 rounded-2xl bg-[#0E1015] border border-[#00E5FF]/40 glow-border-cyan shadow-card">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-gray-400 mb-1">
            <span>Current Capital</span>
            <Wallet className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white font-mono tracking-tight glow-text-cyan">
            {formatCurrency(currentCapital)}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-mono">
            Deployable account equity
          </p>
        </div>

        {/* Total Deposited */}
        <div className="p-5 rounded-2xl bg-[#0E1015] border border-[#1E2330] shadow-card">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-gray-400 mb-1">
            <span>Total Deposited</span>
            <ArrowUpCircle className="w-4 h-4 text-[#00E676]" />
          </div>
          <div className="text-2xl font-black text-[#00E676] font-mono tracking-tight">
            +{formatCurrency(totalDeposited)}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-mono">
            Cumulative external capital in
          </p>
        </div>

        {/* Total Withdrawn */}
        <div className="p-5 rounded-2xl bg-[#0E1015] border border-[#1E2330] shadow-card">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-gray-400 mb-1">
            <span>Total Withdrawn</span>
            <ArrowDownCircle className="w-4 h-4 text-[#FF4560]" />
          </div>
          <div className="text-2xl font-black text-[#FF4560] font-mono tracking-tight">
            -{formatCurrency(totalWithdrawn)}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-mono">
            Cumulative team payouts out
          </p>
        </div>

        {/* Net Trading Returns */}
        <div className="p-5 rounded-2xl bg-[#0E1015] border border-[#1E2330] shadow-card">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-gray-400 mb-1">
            <span>Net Trading Returns</span>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <div className={`text-2xl font-black font-mono tracking-tight ${
            netTradingPnL >= 0 ? 'text-[#00E676]' : 'text-red-400'
          }`}>
            {netTradingPnL >= 0 ? '+' : ''}{formatCurrency(netTradingPnL)}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-mono">
            Combined trading P&L earned
          </p>
        </div>
      </div>

      {/* Capital Ledger Table */}
      <div className="rounded-2xl bg-[#0E1015] border border-[#1E2330] p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <History className="w-4 h-4 text-[#00E5FF]" />
              Capital Transactions Ledger
            </h3>
            <p className="text-xs text-gray-400">Chronological history of team capital adjustments</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-mono text-xs">
            No funding events recorded. Use "DEPOSIT FUNDS" to inject initial trading balance.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1E2330] text-gray-400 uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Notes / Memo</th>
                  <th className="py-3 px-4 text-gray-500">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2330]/60">
                {transactions.map((t) => {
                  const isDeposit = t.type === 'deposit';
                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{t.date}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          isDeposit
                            ? 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/30'
                            : 'bg-[#FF4560]/15 text-[#FF4560] border-[#FF4560]/30'
                        }`}>
                          {isDeposit ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {t.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold text-sm ${
                        isDeposit ? 'text-[#00E676]' : 'text-[#FF4560]'
                      }`}>
                        {isDeposit ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td className="py-3 px-4 text-gray-300 max-w-sm truncate">
                        {t.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[11px]">
                        {t.created_at ? new Date(t.created_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit / Withdraw Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0E1015] border border-[#1E2330] rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white uppercase font-mono tracking-wider mb-1">
              {txType === 'deposit' ? 'Deposit Trading Capital' : 'Withdraw Trading Capital'}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {txType === 'deposit'
                ? 'Inject capital into DuoAlpha trading equity.'
                : 'Withdraw accumulated profits or capital from team pool.'}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#141822] border border-[#1E2330] text-white text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 50000"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#141822] border border-[#1E2330] text-white text-sm font-mono focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Notes / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wire transfer from primary trading account"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141822] border border-[#1E2330] text-white text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#141822] text-xs font-mono text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-lg ${
                    txType === 'deposit'
                      ? 'bg-[#00E676] text-black hover:bg-[#00E676]/90 shadow-[#00E676]/20'
                      : 'bg-[#FF4560] text-white hover:bg-[#FF4560]/90 shadow-[#FF4560]/20'
                  }`}
                >
                  {txType === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

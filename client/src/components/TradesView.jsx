import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Plus,
  Trash2,
  Edit2,
  ArrowUpDown,
  Filter,
  Check,
  X,
  FileText
} from 'lucide-react';

export default function TradesView({
  trades,
  onAddTrade,
  onUpdateTrade,
  onDeleteTrade,
  stats
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all | profit | loss
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAmount, setFormAmount] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingTrade(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormAmount('');
    setFormNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (trade) => {
    setEditingTrade(trade);
    setFormDate(trade.date);
    setFormAmount(trade.amount >= 0 ? `+${trade.amount}` : `${trade.amount}`);
    setFormNotes(trade.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Clean and validate amount (+2500 or -1200 or 2500)
    let cleanedAmt = formAmount.trim().replace('₹', '').replace('$', '').replace(/,/g, '');
    const num = parseFloat(cleanedAmt);
    if (isNaN(num)) {
      setFormError('Please enter a valid numeric amount (e.g. +2500 or -1200)');
      return;
    }

    try {
      if (editingTrade) {
        await onUpdateTrade(editingTrade.id, {
          date: formDate,
          amount: num,
          notes: formNotes
        });
      } else {
        await onAddTrade({
          date: formDate,
          amount: num,
          notes: formNotes
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to save trade');
    }
  };

  // Filter and sort logic
  const filteredTrades = trades
    .filter((t) => {
      const matchesSearch =
        t.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterType === 'profit') return t.amount > 0;
      if (filterType === 'loss') return t.amount < 0;
      return true;
    })
    .sort((a, b) => {
      let comp = 0;
      if (sortBy === 'date') {
        comp = a.date.localeCompare(b.date);
      } else if (sortBy === 'amount') {
        comp = a.amount - b.amount;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return (num < 0 ? '-₹' : '₹') + Math.abs(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00E676]" />
            Trading Entries & History
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Record positions (+ for profit, - for loss). Real-time Net P&L synchronization.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wider bg-[#00E676] text-black hover:bg-[#00E676]/90 active:scale-95 transition-all shadow-lg shadow-[#00E676]/20 font-mono"
        >
          <Plus className="w-4 h-4" />
          ADD TRADE ENTRY
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#0E1015] border border-[#1E2330]">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search date or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#141822] border border-[#1E2330] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E676] font-mono"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-[#141822] border border-[#1E2330] rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterType === 'all' ? 'bg-[#00E676] text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({trades.length})
            </button>
            <button
              onClick={() => setFilterType('profit')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterType === 'profit' ? 'bg-[#00E676] text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Profits
            </button>
            <button
              onClick={() => setFilterType('loss')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterType === 'loss' ? 'bg-red-500 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Losses
            </button>
          </div>

          {/* Sort By Date / Amount */}
          <button
            onClick={() => {
              if (sortBy === 'date') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy('date');
                setSortOrder('desc');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141822] border border-[#1E2330] text-xs font-mono text-gray-300 hover:text-white"
            title="Toggle sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Date ({sortOrder.toUpperCase()})</span>
          </button>
        </div>
      </div>

      {/* Trades Table */}
      <div className="rounded-2xl bg-[#0E1015] border border-[#1E2330] overflow-hidden shadow-card">
        {filteredTrades.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-mono text-xs">
            <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            No trade entries found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#141822]/70 border-b border-[#1E2330] text-gray-400 uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4">Trade Notes</th>
                  <th className="py-3 px-4 text-gray-500">Created Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2330]/60">
                {filteredTrades.map((trade) => {
                  const isProfit = trade.amount >= 0;
                  return (
                    <tr
                      key={trade.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-white">
                        {trade.date}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                            isProfit
                              ? 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/40'
                              : 'bg-red-500/15 text-red-400 border-red-500/40'
                          }`}
                        >
                          {isProfit ? 'PROFIT' : 'LOSS'}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold text-sm ${
                          isProfit ? 'text-[#00E676]' : 'text-red-400'
                        }`}
                      >
                        {isProfit ? '+' : ''}{formatCurrency(trade.amount)}
                      </td>
                      <td className="py-3 px-4 text-gray-300 max-w-sm truncate">
                        {trade.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[11px]">
                        {trade.created_at ? new Date(trade.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(trade)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Edit Trade"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete trade entry of ${trade.amount >= 0 ? '+' : ''}₹${trade.amount}?`)) {
                                onDeleteTrade(trade.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Trade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Trade Modal */}
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
              {editingTrade ? 'Edit Trading Entry' : 'New Trading Entry'}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Enter profit as positive (e.g. +2500) or loss as negative (e.g. -1200).
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Trade Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#141822] border border-[#1E2330] text-white text-xs font-mono focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Amount (₹) (+ Profit / - Loss)
                </label>
                <input
                  type="text"
                  placeholder="+2500 or -1200"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#141822] border border-[#1E2330] text-white text-sm font-mono focus:outline-none focus:border-[#00E676]"
                />
                <p className="text-[11px] text-gray-500 mt-1 font-mono">
                  Prefix with + for profit, - for loss.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Notes / Strategy / Ticker
                </label>
                <textarea
                  placeholder="e.g. NIFTY Bull Call Spread breakout trade"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[#141822] border border-[#1E2330] text-white text-xs font-mono focus:outline-none focus:border-[#00E676]"
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
                  className="px-5 py-2 rounded-xl bg-[#00E676] text-black text-xs font-mono font-bold hover:bg-[#00E676]/90 transition-all shadow-lg shadow-[#00E676]/20"
                >
                  {editingTrade ? 'Update Trade' : 'Save Trade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

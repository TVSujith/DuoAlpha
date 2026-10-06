import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  FileCode,
  Calendar,
  CheckCircle,
  TrendingUp,
  Table
} from 'lucide-react';
import { apiRequest } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsView({ trades, capitalSummary }) {
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyReports();
  }, []);

  const fetchMonthlyReports = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/reports/monthly');
      setMonthlyReports(data.report || []);
    } catch (err) {
      console.error('Failed to fetch monthly report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/reports/export/csv', '_blank');
  };

  const handleExportExcel = () => {
    window.open('/api/reports/export/excel', '_blank');
  };

  // Generate Institutional PDF Report using jsPDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Brand Title Header
      doc.setFillColor(7, 8, 10);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(0, 230, 118);
      doc.setFontSize(22);
      doc.text('DUOALPHA TRADING REPORT', 14, 20);

      doc.setTextColor(0, 229, 255);
      doc.setFontSize(10);
      doc.text('Trade Together. Grow Together. — Official Performance Audit', 14, 28);

      doc.setTextColor(180, 180, 180);
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35);

      // Capital & High Level Metrics
      let y = 50;
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(14);
      doc.text('1. Portfolio Overview', 14, y);

      y += 8;
      const curCap = capitalSummary?.currentCapital || 0;
      const netPnl = capitalSummary?.netTradingPnL || 0;

      autoTable(doc, {
        startY: y,
        head: [['Current Capital (INR)', 'Total Deposited', 'Total Withdrawn', 'Net Trading Returns']],
        body: [[
          `Rs. ${curCap.toLocaleString('en-IN')}`,
          `Rs. ${(capitalSummary?.totalDeposited || 0).toLocaleString('en-IN')}`,
          `Rs. ${(capitalSummary?.totalWithdrawn || 0).toLocaleString('en-IN')}`,
          `Rs. ${netPnl.toLocaleString('en-IN')}`
        ]],
        theme: 'striped',
        headStyles: { fillColor: [14, 16, 21] }
      });

      // Monthly Breakdown
      y = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('2. Monthly Summary Performance', 14, y);

      y += 8;
      const monthlyRows = monthlyReports.map(m => [
        m.month,
        m.totalTrades,
        m.winningTrades,
        m.losingTrades,
        `Rs. ${m.grossProfit.toLocaleString('en-IN')}`,
        `Rs. ${m.grossLoss.toLocaleString('en-IN')}`,
        `${m.netPnL >= 0 ? '+' : ''}Rs. ${m.netPnL.toLocaleString('en-IN')}`,
        `${m.winRate}%`
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Month', 'Trades', 'Wins', 'Losses', 'Gross Win', 'Gross Loss', 'Net P&L', 'Win Rate']],
        body: monthlyRows.length > 0 ? monthlyRows : [['No data', '-', '-', '-', '-', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [0, 230, 118], textColor: [0, 0, 0] }
      });

      // Recent Trades Table
      y = doc.lastAutoTable.finalY + 15;
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.text('3. Detailed Trade Logs', 14, y);

      y += 8;
      const tradeRows = trades.slice(0, 30).map(t => [
        t.date,
        t.amount >= 0 ? 'PROFIT' : 'LOSS',
        `${t.amount >= 0 ? '+' : ''}Rs. ${Number(t.amount).toLocaleString('en-IN')}`,
        t.notes || '—'
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Date', 'Type', 'Amount (INR)', 'Notes / Strategy']],
        body: tradeRows.length > 0 ? tradeRows : [['No trades', '-', '-', '-']],
        theme: 'striped',
        headStyles: { fillColor: [20, 24, 34] }
      });

      doc.save(`duoalpha_official_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error('PDF export error:', e);
      alert('Failed to generate PDF. Check console.');
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
      {/* Header and Download buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#00E5FF]" />
            Reports & Data Exports
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Audit-ready Monthly Summaries, Excel Worksheets, CSV, and Institutional PDF statements.
          </p>
        </div>

        {/* Download action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141822] border border-[#1E2330] hover:border-[#00E676] text-xs font-mono text-gray-300 hover:text-white transition-all shadow-sm"
          >
            <FileCode className="w-4 h-4 text-[#00E676]" />
            Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141822] border border-[#1E2330] hover:border-[#00E5FF] text-xs font-mono text-gray-300 hover:text-white transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-[#00E5FF]" />
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00E5FF] text-black font-semibold text-xs font-mono tracking-wider shadow-lg shadow-[#00E676]/20 hover:opacity-95 transition-all"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Monthly Summary Breakdown Table */}
      <div className="rounded-2xl bg-[#0E1015] border border-[#1E2330] p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00E676]" />
              Monthly Performance Summary
            </h3>
            <p className="text-xs text-gray-400">Aggregated breakdown of win/loss velocity and monthly net margins</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-gray-500">
            Generating monthly report aggregation...
          </div>
        ) : monthlyReports.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-gray-500">
            No monthly trading history found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1E2330] text-gray-400 uppercase">
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-center">Trades</th>
                  <th className="py-3 px-4 text-center">Win / Loss</th>
                  <th className="py-3 px-4 text-right">Gross Profit</th>
                  <th className="py-3 px-4 text-right">Gross Loss</th>
                  <th className="py-3 px-4 text-right">Net P&L</th>
                  <th className="py-3 px-4 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2330]/60">
                {monthlyReports.map((m) => {
                  const isProfit = m.netPnL >= 0;
                  return (
                    <tr key={m.month} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00E676]" />
                        {m.month}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-300">
                        {m.totalTrades}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-300">
                        <span className="text-[#00E676]">{m.winningTrades}W</span>
                        <span className="text-gray-500 mx-1">/</span>
                        <span className="text-red-400">{m.losingTrades}L</span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#00E676] font-semibold">
                        +{formatCurrency(m.grossProfit)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-400 font-semibold">
                        -{formatCurrency(m.grossLoss)}
                      </td>
                      <td className={`py-3 px-4 text-right font-black text-sm ${
                        isProfit ? 'text-[#00E676]' : 'text-red-400'
                      }`}>
                        {isProfit ? '+' : ''}{formatCurrency(m.netPnL)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#00E5FF]">
                        {m.winRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  KeyRound,
  Download,
  Upload,
  Moon,
  AlertTriangle,
  Target,
  Users,
  Check,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '../services/api';

export default function SettingsView({
  settings,
  onUpdateSettings,
  onReloadAllData
}) {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMessage, setPwMessage] = useState({ type: '', text: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // Risk & Goals
  const [dailyLossLimit, setDailyLossLimit] = useState(settings?.daily_loss_limit || '5000');
  const [monthlyProfitGoal, setMonthlyProfitGoal] = useState(settings?.monthly_profit_goal || '50000');
  const [partner1, setPartner1] = useState(settings?.partner_name_1 || 'Sujith');
  const [partner2, setPartner2] = useState(settings?.partner_name_2 || 'Bhuvana');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Restore file
  const [restoreStatus, setRestoreStatus] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPwMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setPwLoading(true);
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      setPwMessage({ type: 'success', text: 'Master password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwMessage({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await onUpdateSettings({
        daily_loss_limit: dailyLossLimit,
        monthly_profit_goal: monthlyProfitGoal,
        partner_name_1: partner1,
        partner_name_2: partner2
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    }
  };

  const handleDownloadDbBackup = () => {
    window.open('/api/settings/backup/db', '_blank');
  };

  const handleDownloadJsonBackup = () => {
    window.open('/api/settings/backup/json', '_blank');
  };

  const handleFileUploadRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Restoring will overwrite current system data with the backup file. Proceed?')) {
      e.target.value = '';
      return;
    }

    try {
      setRestoreStatus('Reading and restoring backup file...');
      const text = await file.text();
      const jsonData = JSON.parse(text);

      await apiRequest('/settings/restore/json', {
        method: 'POST',
        body: JSON.stringify(jsonData)
      });

      setRestoreStatus('Database successfully restored! Reloading data...');
      if (onReloadAllData) onReloadAllData();
      setTimeout(() => setRestoreStatus(''), 4000);
    } catch (err) {
      setRestoreStatus(`Error: ${err.message || 'Failed to restore JSON file'}`);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#00E676]" />
          Terminal Settings & Controls
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Configure risk thresholds, monthly profit targets, team partners, and cryptographic backups.
        </p>
      </div>

      {/* Grid of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk & Profit Goal Management */}
        <div className="p-6 rounded-2xl bg-[#0E1015] border border-[#1E2330] shadow-card space-y-4">
          <div className="flex items-center gap-2 text-white font-mono font-bold text-sm uppercase">
            <Target className="w-4 h-4 text-[#00E676]" />
            Trading Targets & Risk Limits
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1 flex items-center justify-between">
                <span>Maximum Daily Loss Limit (₹)</span>
                <span className="text-red-400 text-[10px]">Triggers Lockout Warning</span>
              </label>
              <input
                type="number"
                value={dailyLossLimit}
                onChange={(e) => setDailyLossLimit(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#141822] border border-[#1E2330] text-white text-sm font-mono focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                Monthly Profit Goal (₹)
              </label>
              <input
                type="number"
                value={monthlyProfitGoal}
                onChange={(e) => setMonthlyProfitGoal(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#141822] border border-[#1E2330] text-white text-sm font-mono focus:outline-none focus:border-[#00E676]"
              />
            </div>

            <div className="pt-2 border-t border-[#1E2330]">
              <div className="text-xs font-mono uppercase text-gray-400 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#00E5FF]" />
                Two-Person Team Names
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gray-500 mb-1">Partner 1</label>
                  <input
                    type="text"
                    value={partner1}
                    onChange={(e) => setPartner1(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#141822] border border-[#1E2330] text-white text-xs font-mono focus:outline-none focus:border-[#00E676]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gray-500 mb-1">Partner 2</label>
                  <input
                    type="text"
                    value={partner2}
                    onChange={(e) => setPartner2(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#141822] border border-[#1E2330] text-white text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#00E676] text-black font-semibold text-xs font-mono tracking-wider hover:bg-[#00E676]/90 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#00E676]/20"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>SETTINGS APPLIED!</span>
                </>
              ) : (
                <span>SAVE CONFIGURATION</span>
              )}
            </button>
          </form>
        </div>

        {/* Change Master Password */}
        <div className="p-6 rounded-2xl bg-[#0E1015] border border-[#1E2330] shadow-card space-y-4">
          <div className="flex items-center gap-2 text-white font-mono font-bold text-sm uppercase">
            <KeyRound className="w-4 h-4 text-[#00E5FF]" />
            Security & Authentication
          </div>

          {pwMessage.text && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                pwMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {pwMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{pwMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#141822] border border-[#1E2330] text-white text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                New Master Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#141822] border border-[#1E2330] text-white text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#141822] border border-[#1E2330] text-white text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#141822] border border-[#00E5FF]/40 text-[#00E5FF] font-semibold text-xs font-mono tracking-wider hover:bg-[#00E5FF]/10 transition-all flex items-center justify-center gap-1.5"
            >
              {pwLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </form>
        </div>
      </div>

      {/* Database Backup & Restore */}
      <div className="p-6 rounded-2xl bg-[#0E1015] border border-[#1E2330] shadow-card space-y-4">
        <div className="flex items-center gap-2 text-white font-mono font-bold text-sm uppercase">
          <Shield className="w-4 h-4 text-[#00E676]" />
          Database Backup & Disaster Recovery
        </div>
        <p className="text-xs text-gray-400">
          Create complete atomic snapshots of your trades, capital transactions, and chat records.
        </p>

        {restoreStatus && (
          <div className="p-3 rounded-xl bg-[#141822] border border-[#00E5FF]/30 text-xs font-mono text-[#00E5FF]">
            {restoreStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Download SQLite DB */}
          <button
            onClick={handleDownloadDbBackup}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#141822] border border-[#1E2330] hover:border-[#00E676] text-gray-300 hover:text-white transition-all group"
          >
            <Download className="w-6 h-6 text-[#00E676] mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-mono font-bold">Download SQLite (.db)</span>
            <span className="text-[10px] text-gray-500 mt-1">Full binary replica</span>
          </button>

          {/* Download JSON Backup */}
          <button
            onClick={handleDownloadJsonBackup}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#141822] border border-[#1E2330] hover:border-[#00E5FF] text-gray-300 hover:text-white transition-all group"
          >
            <Download className="w-6 h-6 text-[#00E5FF] mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-mono font-bold">Download JSON (.json)</span>
            <span className="text-[10px] text-gray-500 mt-1">Portable human-readable export</span>
          </button>

          {/* Restore JSON Backup */}
          <label className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#141822] border border-[#1E2330] hover:border-amber-400 text-gray-300 hover:text-white transition-all cursor-pointer group">
            <Upload className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-mono font-bold">Restore Database</span>
            <span className="text-[10px] text-gray-500 mt-1">Upload backup JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUploadRestore}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

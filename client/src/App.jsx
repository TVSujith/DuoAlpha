import React, { useState, useEffect } from 'react';
import {
  getAuthToken,
  setAuthToken,
  getCurrentUser,
  setCurrentUser,
  apiRequest,
  getSocket
} from './services/api';

import LoginView from './components/LoginView';
import PeakTransition from './components/PeakTransition';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import TradesView from './components/TradesView';
import CapitalView from './components/CapitalView';
import AnalyticsView from './components/AnalyticsView';
import ReportsView from './components/ReportsView';
import AlphaRoomView from './components/AlphaRoomView';
import SettingsView from './components/SettingsView';
import NotificationToast from './components/NotificationToast';

export default function App() {
  const [authToken, setToken] = useState(getAuthToken());
  const [currentUser, setUser] = useState(getCurrentUser());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Partner persona
  const [partnerNames, setPartnerNames] = useState({
    partner1: 'Sujith',
    partner2: 'Bhuvana'
  });
  const [activeSpeaker, setActiveSpeaker] = useState('Sujith');

  // Application Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [trades, setTrades] = useState([]);
  const [tradeStats, setTradeStats] = useState(null);
  const [capitalData, setCapitalData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notifications and Unread Messages
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(1);

  // Quick modals control
  const [quickAddTradeTrigger, setQuickAddTradeTrigger] = useState(false);
  const [quickCapitalTrigger, setQuickCapitalTrigger] = useState(false);

  // Handle successful login
  const handleLoginSuccess = () => {
    setToken(getAuthToken());
    setUser(getCurrentUser());
    setIsTransitioning(true); // Launch glowing market peak transition!
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setToken(null);
    setUser(null);
    setIsTransitioning(false);
  };

  // Add notification to queue
  const addNotification = (notif) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { ...notif, id }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 6000);
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Fetch all core system data
  const loadAllData = async () => {
    if (!getAuthToken()) return;
    try {
      setLoading(true);
      const [dash, trs, st, cap, sett] = await Promise.all([
        apiRequest('/dashboard'),
        apiRequest('/trades'),
        apiRequest('/trades/stats'),
        apiRequest('/capital'),
        apiRequest('/settings')
      ]);

      setDashboardData(dash);
      setTrades(trs.trades || []);
      setTradeStats(st);
      setCapitalData(cap);
      setSettings(sett.settings || {});

      if (sett.settings?.partner_name_1) {
        setPartnerNames({
          partner1: sett.settings.partner_name_1,
          partner2: sett.settings.partner_name_2 || 'Bhuvana'
        });
      }
    } catch (err) {
      console.error('Error loading DuoAlpha state:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and socket listeners
  useEffect(() => {
    if (authToken) {
      loadAllData();

      const socket = getSocket();

      socket.on('presence:update', (data) => {
        setOnlineCount(data.onlineCount || 1);
      });

      socket.on('chat:message', (msg) => {
        // If not in Alpha Room, increment unread badge
        if (activeTab !== 'alpha-room') {
          setUnreadCount((c) => c + 1);
        }
      });

      socket.on('trade:created', ({ trade, stats }) => {
        setTrades((prev) => [trade, ...prev]);
        setTradeStats(stats);
        loadAllData();
      });

      socket.on('trade:updated', ({ trade, stats }) => {
        setTrades((prev) => prev.map((t) => (t.id === trade.id ? trade : t)));
        setTradeStats(stats);
        loadAllData();
      });

      socket.on('trade:deleted', ({ id, stats }) => {
        setTrades((prev) => prev.filter((t) => t.id !== id));
        setTradeStats(stats);
        loadAllData();
      });

      socket.on('capital:updated', () => {
        loadAllData();
      });

      socket.on('settings:updated', () => {
        loadAllData();
      });

      socket.on('system:alert', (alert) => {
        addNotification(alert);
      });

      socket.on('data:reload', () => {
        loadAllData();
      });

      return () => {
        socket.off('presence:update');
        socket.off('chat:message');
        socket.off('trade:created');
        socket.off('trade:updated');
        socket.off('trade:deleted');
        socket.off('capital:updated');
        socket.off('settings:updated');
        socket.off('system:alert');
        socket.off('data:reload');
      };
    }
  }, [authToken, activeTab]);

  // Trade actions
  const handleAddTrade = async (tradeData) => {
    await apiRequest('/trades', {
      method: 'POST',
      body: JSON.stringify(tradeData)
    });
    addNotification({
      type: 'trade_created',
      title: 'Trade Executed',
      message: `${tradeData.amount >= 0 ? 'Profit +' : 'Loss -'}₹${Math.abs(tradeData.amount).toLocaleString('en-IN')} logged.`
    });
    loadAllData();
  };

  const handleUpdateTrade = async (id, tradeData) => {
    await apiRequest(`/trades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tradeData)
    });
    loadAllData();
  };

  const handleDeleteTrade = async (id) => {
    await apiRequest(`/trades/${id}`, {
      method: 'DELETE'
    });
    loadAllData();
  };

  const handleAddCapitalTransaction = async (txData) => {
    await apiRequest('/capital', {
      method: 'POST',
      body: JSON.stringify(txData)
    });
    loadAllData();
  };

  const handleUpdateSettings = async (newSettings) => {
    await apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(newSettings)
    });
    loadAllData();
  };

  // 1. Not Authenticated: Render Login Page
  if (!authToken) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Authenticated but running DuoAlpha Peak Transition:
  if (isTransitioning) {
    return <PeakTransition onComplete={() => setIsTransitioning(false)} />;
  }

  // 3. Render Dashboard Shell
  return (
    <div className="min-h-screen bg-[#07080A] text-white flex flex-col font-sans selection:bg-[#00E676]/30">
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'alpha-room') setUnreadCount(0);
        }}
        onLogout={handleLogout}
        unreadCount={unreadCount}
        dailyLossBreached={tradeStats?.dailyLossBreached}
        activeSpeaker={activeSpeaker}
        setActiveSpeaker={setActiveSpeaker}
        partnerNames={partnerNames}
        onlineCount={onlineCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            dashboardData={dashboardData}
            onOpenAddTrade={() => setActiveTab('trades')}
            onOpenCapitalModal={() => setActiveTab('capital')}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'trades' && (
          <TradesView
            trades={trades}
            onAddTrade={handleAddTrade}
            onUpdateTrade={handleUpdateTrade}
            onDeleteTrade={handleDeleteTrade}
            stats={tradeStats}
          />
        )}

        {activeTab === 'capital' && (
          <CapitalView
            capitalData={capitalData}
            onAddCapitalTransaction={handleAddCapitalTransaction}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            stats={tradeStats}
            capitalSummary={capitalData}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            trades={trades}
            capitalSummary={capitalData}
          />
        )}

        {activeTab === 'alpha-room' && (
          <AlphaRoomView
            activeSpeaker={activeSpeaker}
            setActiveSpeaker={setActiveSpeaker}
            partnerNames={partnerNames}
            onResetUnread={() => setUnreadCount(0)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onReloadAllData={loadAllData}
          />
        )}
      </main>

      {/* Floating System Notifications */}
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}

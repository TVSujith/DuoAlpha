import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, MessageSquare, TrendingUp, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function NotificationToast({ notifications, onDismiss }) {
  useEffect(() => {
    // If goal achievement alert is triggered, shoot celebratory confetti!
    const goalAlert = notifications.find(n => n.type === 'goal_achievement');
    if (goalAlert) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore if not loaded
      }
    }
  }, [notifications]);

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => {
        let borderClass = 'border-[#1E2330]';
        let bgClass = 'bg-[#0E1015]/95';
        let icon = <CheckCircle className="w-5 h-5 text-[#00E676]" />;

        if (notif.type === 'risk_warning') {
          borderClass = 'border-red-500/60 shadow-lg shadow-red-500/20';
          bgClass = 'bg-[#180A0A]/95';
          icon = <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
        } else if (notif.type === 'goal_achievement') {
          borderClass = 'border-[#00E676]/60 shadow-lg shadow-[#00E676]/20';
          bgClass = 'bg-[#0A1A12]/95';
          icon = <TrendingUp className="w-5 h-5 text-[#00E676]" />;
        } else if (notif.type === 'chat_notification') {
          borderClass = 'border-[#00E5FF]/40';
          bgClass = 'bg-[#0E131A]/95';
          icon = <MessageSquare className="w-5 h-5 text-[#00E5FF]" />;
        }

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borderClass} ${bgClass} backdrop-blur-xl shadow-2xl transition-all duration-300 animate-slide-up`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white tracking-wide">{notif.title}</h4>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
            </div>
            <button
              onClick={() => onDismiss(notif.id)}
              className="text-gray-500 hover:text-white shrink-0 p-1 rounded hover:bg-white/5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MessageSquare,
  Radio,
  User,
  Users,
  Smile,
  Shield,
  Trash2,
  Volume2,
  VolumeX,
  Clock
} from 'lucide-react';
import { apiRequest, getSocket } from '../services/api';

export default function AlphaRoomView({
  activeSpeaker,
  setActiveSpeaker,
  partnerNames,
  onResetUnread
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Clear unread badge when user opens Alpha Room
    if (onResetUnread) onResetUnread();
    fetchMessages();

    const socket = getSocket();

    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        // avoid duplicates
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // Play soft synthesized alert tone if sender is other
      if (soundEnabled && msg.sender !== activeSpeaker) {
        playNotificationBeep();
      }
    };

    const handleTyping = (data) => {
      if (data.sender !== activeSpeaker) {
        setPartnerTyping(data.isTyping ? data.sender : null);
      }
    };

    socket.on('chat:message', handleNewMessage);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:message', handleNewMessage);
      socket.off('chat:typing', handleTyping);
    };
  }, [activeSpeaker, soundEnabled]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, partnerTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const data = await apiRequest('/chat?limit=150');
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  const playNotificationBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // AudioContext could be blocked by autoplay policies
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    // Emit stopped typing
    const socket = getSocket();
    socket.emit('chat:typing', { sender: activeSpeaker, isTyping: false });

    try {
      await apiRequest('/chat', {
        method: 'POST',
        body: JSON.stringify({
          sender: activeSpeaker,
          text: textToSend
        })
      });
    } catch (err) {
      console.error('Failed to send chat message:', err);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('chat:typing', { sender: activeSpeaker, isTyping: true });
      setTimeout(() => {
        setIsTyping(false);
        socket.emit('chat:typing', { sender: activeSpeaker, isTyping: false });
      }, 3000);
    }
  };

  const quickTemplates = [
    'Market looks bullish today.',
    'Waiting for breakout.',
    'Risk limits checked & respected.',
    'Closed position with profit!',
    'Holding through session volatility.'
  ];

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-[#0E1015] border border-[#1E2330] shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00E676]/10 text-[#00E676]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                Alpha Room
                <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
              </h2>
              <p className="text-xs text-gray-400">
                Encrypted real-time trading floor synchronization
              </p>
            </div>
          </div>
        </div>

        {/* Room Controls: Switch persona, audio toggle */}
        <div className="flex items-center gap-3">
          {/* Active Speaking Persona Selector */}
          <div className="flex items-center bg-[#141822] border border-[#1E2330] rounded-xl p-1 text-xs font-mono">
            <span className="text-gray-500 px-2 flex items-center gap-1 text-[11px]">
              Chat As:
            </span>
            <button
              onClick={() => setActiveSpeaker(partnerNames.partner1 || 'Sujith')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSpeaker === (partnerNames.partner1 || 'Sujith')
                  ? 'bg-[#00E676] text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {partnerNames.partner1 || 'Sujith'}
            </button>
            <button
              onClick={() => setActiveSpeaker(partnerNames.partner2 || 'Bhuvana')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSpeaker === (partnerNames.partner2 || 'Bhuvana')
                  ? 'bg-[#00E5FF] text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {partnerNames.partner2 || 'Bhuvana'}
            </button>
          </div>

          {/* Sound Mute/Unmute */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-[#141822] border border-[#1E2330] text-gray-400 hover:text-white transition-all"
            title={soundEnabled ? 'Mute Chimes' : 'Unmute Chimes'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#00E676]" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 bg-[#0E1015] border border-[#1E2330] rounded-2xl p-4 overflow-y-auto space-y-4 shadow-card">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 font-mono text-xs">
            <MessageSquare className="w-10 h-10 text-gray-600 mb-2" />
            <p className="font-semibold text-gray-400">Welcome to Alpha Room</p>
            <p className="mt-1 max-w-sm">
              Your dedicated private channel to align on trade ideas, position sizing, and intraday strategies.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === activeSpeaker;
            const isPartner1 = msg.sender === (partnerNames.partner1 || 'Sujith');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-xl ${
                  isMe ? 'ml-auto' : 'mr-auto'
                }`}
              >
                {/* Sender Name & Timestamp */}
                <div className="flex items-center gap-2 mb-1 px-1 text-[11px] font-mono">
                  <span
                    className={`font-bold ${
                      isPartner1 ? 'text-[#00E676]' : 'text-[#00E5FF]'
                    }`}
                  >
                    {msg.sender}
                  </span>
                  <span className="text-gray-500 flex items-center gap-1 text-[10px]">
                    <Clock className="w-3 h-3" />
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm font-sans break-words border shadow-md ${
                    isMe
                      ? isPartner1
                        ? 'bg-[#00E676]/15 border-[#00E676]/30 text-white rounded-tr-none'
                        : 'bg-[#00E5FF]/15 border-[#00E5FF]/30 text-white rounded-tr-none'
                      : 'bg-[#141822] border-[#1E2330] text-gray-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}

        {/* Partner Typing Indicator */}
        {partnerTyping && (
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 pl-2">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-bounce" />
            <span>{partnerTyping} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Trade Templates Strip */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0">
        <span className="text-[10px] font-mono uppercase text-gray-500 whitespace-nowrap pl-1">
          Quick Memos:
        </span>
        {quickTemplates.map((tmpl, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(tmpl)}
            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#141822] border border-[#1E2330] hover:border-[#00E676]/40 text-gray-400 hover:text-white whitespace-nowrap transition-all"
          >
            {tmpl}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 p-2 rounded-2xl bg-[#0E1015] border border-[#1E2330] shrink-0"
      >
        <input
          type="text"
          placeholder={`Type message as ${activeSpeaker}...`}
          value={inputText}
          onChange={handleInputChange}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none font-sans"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00E5FF] text-black font-semibold text-xs tracking-wider flex items-center gap-1.5 hover:opacity-95 active:scale-95 transition-all disabled:opacity-40 font-mono shadow-lg shadow-[#00E676]/20"
        >
          <span>SEND</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Mascot } from '../Mascot';
import { BrandLogo } from '../BrandLogo';
import { A2UIRenderer } from './A2UIRenderer';
import { sendChatMessage } from '../../services/api';
import { X, Send, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';
import { Language } from '../../i18n/translations';

interface FloatingChatProps {
  lang: Language;
  t: any;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({ lang, t }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'agent'; text?: string; a2ui?: any }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message in active language
    const welcomeText = {
      en: "Hello! I am ShareNest Assistant. I can help you record surplus food donations, estimate impact, or find verified care homes nearby.",
      te: "నమస్కారం! నేను షేర్‌నెస్ట్ AI సహాయకుడిని. మీరు ఆహార విరాళాలు నమోదు చేయడంలో లేదా సమీపంలోని ఆశ్రమాలను కనుగొనడంలో నేను సహాయపడతాను.",
      hi: "नमस्ते! मैं शेयरनेस्ट AI सहायक हूँ। मैं अतिरिक्त भोजन दान दर्ज करने या निकटतम प्रमाणित आश्रमों से जुड़ने में आपकी सहायता कर सकता हूँ।",
    }[lang];

    setMessages([
      {
        sender: 'agent',
        text: welcomeText,
      },
    ]);
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    const userEntry = { sender: 'user' as const, text: textToSend };
    setMessages((prev) => [...prev, userEntry]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(textToSend, lang);
      if (response && response.parts) {
        response.parts.forEach((part: any) => {
          if (part.kind === 'text') {
            setMessages((prev) => [...prev, { sender: 'agent', text: part.text }]);
          } else if (part.kind === 'a2ui') {
            setMessages((prev) => [...prev, { sender: 'agent', a2ui: part.data }]);
          }
        });
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: lang === 'te'
            ? "క్షమించండి, సర్వర్‌ను సంప్రదించడంలో సమస్య ఉంది. దయచేసి మళ్ళీ ప్రయత్నించండి."
            : lang === 'hi'
            ? "क्षमा करें, सर्वर से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें।"
            : "Sorry, could not connect to agent right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 bg-emerald-800 hover:bg-emerald-900 text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl hover:shadow-emerald-900/30 transition-all transform hover:-translate-y-1 group border border-emerald-600/30"
        >
          <Mascot size="sm" />
          <div className="text-left">
            <span className="font-bold text-sm block leading-tight">{t.chatTitle}</span>
            <span className="text-[10px] text-emerald-200 block font-medium">Gemini 2.5 Flash</span>
          </div>
          <Sparkles className="w-4 h-4 text-amber-300 ml-1 animate-pulse" />
        </button>
      )}

      {open && (
        <div className="w-[380px] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" />
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  {t.chatTitle}
                  <span className="bg-emerald-700/70 text-emerald-200 text-[10px] px-1.5 py-0.2 rounded font-normal">
                    {lang.toUpperCase()}
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-200/80">{t.chatSubtitle}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => handleSend(t.chatPrompt1)}
              className="bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-800 px-2.5 py-1 rounded-full whitespace-nowrap text-slate-700 shadow-2xs font-medium transition-colors"
            >
              {t.chatPrompt1}
            </button>
            <button
              onClick={() => handleSend(t.chatPrompt2)}
              className="bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-800 px-2.5 py-1 rounded-full whitespace-nowrap text-slate-700 shadow-2xs font-medium transition-colors"
            >
              {t.chatPrompt2}
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {m.text && (
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      m.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-br-none'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                )}
                {m.a2ui && (
                  <div className="w-full mt-2">
                    <A2UIRenderer data={m.a2ui} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200/80 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>{t.chatSubtitle}...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Human-in-the-loop Notice */}
          <div className="bg-amber-50/80 border-t border-amber-200/60 px-3 py-1.5 text-[10px] text-amber-900 flex items-center justify-between">
            <span>{t.chatHumanNotice}</span>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.chatPlaceholder}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white p-2.5 rounded-2xl disabled:opacity-40 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

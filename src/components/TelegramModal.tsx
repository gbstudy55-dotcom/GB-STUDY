import React from 'react';
import { ExternalLink, Send, X } from 'lucide-react';
import { SITE_CONFIG } from '../data/batchesData';

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="telegram-modal-title"
    >
      <div className="relative w-full max-w-md bg-[#121216] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Telegram popup"
          className="absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center text-[#38BDF8] shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400">Official Community Updates</p>
            <h2
              id="telegram-modal-title"
              className="text-lg sm:text-xl font-bold text-white tracking-tight font-display"
            >
              {SITE_CONFIG.telegramPopupTitle}
            </h2>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed mb-6">
          {SITE_CONFIG.telegramPopupSubtitle}
        </p>

        <div className="bg-[#18181E] border border-white/[0.06] rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-zinc-400">Telegram Channel</p>
            <p className="text-sm font-mono font-medium text-[#FACC15] truncate">
              t.me/GBFreestudy
            </p>
          </div>
          <a
            href={SITE_CONFIG.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            Preview <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href={SITE_CONFIG.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black font-semibold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Join Telegram
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-200 font-medium text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

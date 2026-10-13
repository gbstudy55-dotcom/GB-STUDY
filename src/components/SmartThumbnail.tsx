import React, { useState } from 'react';
import { BookOpen, FileText, Folder, Play } from 'lucide-react';

interface SmartThumbnailProps {
  src?: string;
  alt: string;
  fallbackType?: 'batch' | 'video' | 'folder' | 'pdf';
  subtitle?: string;
  className?: string;
}

export const SmartThumbnail: React.FC<SmartThumbnailProps> = ({
  src,
  alt,
  fallbackType = 'batch',
  subtitle,
  className = 'w-full h-full object-cover',
}) => {
  const [hasError, setHasError] = useState(false);

  const cleanSrc = src?.trim() || '';
  const showFallback = !cleanSrc || hasError;

  if (showFallback) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#16161D] via-[#121217] to-[#0B0B0E] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden select-none">
        <div className="w-11 h-11 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/25 flex items-center justify-center text-[#FACC15] mb-2.5 shrink-0">
          {fallbackType === 'video' && <Play className="w-5 h-5 fill-current ml-0.5" />}
          {fallbackType === 'folder' && <Folder className="w-5 h-5" />}
          {fallbackType === 'pdf' && <FileText className="w-5 h-5" />}
          {fallbackType === 'batch' && <BookOpen className="w-5 h-5" />}
        </div>
        <p className="text-xs font-semibold text-zinc-200 line-clamp-2 max-w-[220px] leading-snug">
          {alt}
        </p>
        {subtitle && (
          <p className="text-[11px] text-zinc-500 mt-1 truncate max-w-[180px]">{subtitle}</p>
        )}
      </div>
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  Loader2,
  Maximize,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import {
  DownloadQualityLink,
  extractYouTubeId,
  resolveMediaContent,
  ResolvedMediaResult,
} from '../services/studyApi';

interface MediaPlayerModalProps {
  courseId: number;
  courseTitle: string;
  contentId: string;
  initialTitle: string;
  initialType?: 'video' | 'pdf';
  initialDownloadUrls?: DownloadQualityLink[];
  initialDirectUrl?: string;
  onClose: () => void;
}

interface HlsQualityLevel {
  index: number;
  height: number;
  label: string;
}

export const MediaPlayerModal: React.FC<MediaPlayerModalProps> = ({
  courseId,
  courseTitle,
  contentId,
  initialTitle,
  initialType = 'video',
  initialDownloadUrls = [],
  initialDirectUrl,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<ResolvedMediaResult | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [qualities, setQualities] = useState<HlsQualityLevel[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Active stream URL (user can switch between HLS and direct MP4 resolutions)
  const [activeStreamUrl, setActiveStreamUrl] = useState<string>('');

  // PDF Viewer mode: 'proxy' | 'google' | 'direct'
  const [pdfViewMode, setPdfViewMode] = useState<'proxy' | 'google' | 'direct'>('proxy');

  // HLS chunk downloader state (recreating d.html from the original website)
  const [downloadingChunks, setDownloadingChunks] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatusText, setDownloadStatusText] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        if (initialDirectUrl) {
          const lower = initialDirectUrl.toLowerCase();
          const isPdf = initialType === 'pdf' || lower.includes('.pdf');
          const isYt = lower.includes('youtube.com') || lower.includes('youtu.be');
          if (!cancelled) {
            const res: ResolvedMediaResult = {
              contentId,
              courseId: String(courseId),
              title: initialTitle,
              fileUrl: initialDirectUrl,
              streamUrl: isPdf ? `/api/pdf-stream?url=${encodeURIComponent(initialDirectUrl)}` : undefined,
              thumbnail: '',
              mediaType: isPdf ? 'pdf' : isYt ? 'youtube' : lower.includes('.m3u8') ? 'hls' : 'mp4',
              isLive: false,
              durationSeconds: 0,
              downloadUrls: initialDownloadUrls,
            };
            setMedia(res);
            setActiveStreamUrl(initialDirectUrl);
            setLoading(false);
          }
          return;
        }

        const resolved = await resolveMediaContent(
          courseId,
          contentId,
          initialTitle,
          initialDownloadUrls,
          initialDirectUrl
        );
        if (!cancelled) {
          setMedia(resolved);
          setActiveStreamUrl(resolved.fileUrl);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Media source unavailable from upstream server.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [courseId, contentId, initialTitle, initialType, initialDirectUrl, initialDownloadUrls]);

  // Attach HLS or native video when active stream URL changes
  useEffect(() => {
    if (!media || (media.mediaType !== 'hls' && media.mediaType !== 'mp4')) return;
    const videoEl = videoRef.current;
    if (!videoEl || !activeStreamUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setQualities([]);
    setSelectedQuality(-1);

    if (activeStreamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 60,
          enableWorker: true,
        });
        hlsRef.current = hls;
        hls.loadSource(activeStreamUrl);
        hls.attachMedia(videoEl);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          const levelList: HlsQualityLevel[] = data.levels.map((lvl, idx) => ({
            index: idx,
            height: lvl.height || 0,
            label: lvl.height ? `${lvl.height}p` : `Level ${idx + 1}`,
          }));
          setQualities(levelList);
          videoEl.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                // If fatal error occurs and we have alternative direct MP4 links, auto-fallback
                if (media.downloadUrls && media.downloadUrls.length > 0) {
                  const fallbackMp4 = media.downloadUrls[0]?.url;
                  if (fallbackMp4 && fallbackMp4 !== activeStreamUrl) {
                    hls.destroy();
                    hlsRef.current = null;
                    setActiveStreamUrl(fallbackMp4);
                    return;
                  }
                }
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });
      } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = activeStreamUrl;
        videoEl.play().catch(() => {});
      }
    } else {
      videoEl.src = activeStreamUrl;
      videoEl.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [media, activeStreamUrl]);

  const handleQualityChange = (levelIndex: number) => {
    setSelectedQuality(levelIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
  };

  const handleSwitchToDirectMp4 = (url: string) => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setActiveStreamUrl(url);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleSkip = (deltaSeconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(
        videoRef.current.duration || Infinity,
        videoRef.current.currentTime + deltaSeconds
      )
    );
  };

  const handleFullscreen = () => {
    const target = playerContainerRef.current || videoRef.current;
    if (!target) return;
    if (!document.fullscreenElement) {
      target.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Recreating the HLS stream merger/downloader from d.html
  const handleHlsStreamDownload = async () => {
    const targetUrl = activeStreamUrl || media?.fileUrl;
    if (!targetUrl || downloadingChunks) return;

    if (!targetUrl.includes('.m3u8')) {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.download = `${(media?.title || 'GB_STUDY_Lecture').replace(/[^a-z0-9]/gi, '_')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    setDownloadingChunks(true);
    setDownloadProgress(0);
    setDownloadStatusText('Inspecting HLS stream segments...');

    try {
      const masterRes = await fetch(targetUrl);
      if (!masterRes.ok) throw new Error('Unable to read stream manifest');
      const masterText = await masterRes.text();
      const masterBase = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

      let mediaPlaylistUrl = targetUrl;
      if (masterText.includes('#EXT-X-STREAM-INF')) {
        const lines = masterText.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('#EXT-X-STREAM-INF')) {
            const nextLine = lines[i + 1]?.trim();
            if (nextLine && !nextLine.startsWith('#')) {
              mediaPlaylistUrl = nextLine.startsWith('http') ? nextLine : masterBase + nextLine;
              break;
            }
          }
        }
      }

      const playlistRes = await fetch(mediaPlaylistUrl);
      if (!playlistRes.ok) throw new Error('Unable to fetch media playlist');
      const playlistText = await playlistRes.text();
      const playlistBase = mediaPlaylistUrl.substring(0, mediaPlaylistUrl.lastIndexOf('/') + 1);

      const pLines = playlistText.split('\n');
      const tsUrls: string[] = [];
      let nextIsChunk = false;
      for (const rawLine of pLines) {
        const line = rawLine.trim();
        if (line.startsWith('#EXTINF:')) {
          nextIsChunk = true;
          continue;
        }
        if (nextIsChunk && line && !line.startsWith('#')) {
          tsUrls.push(line.startsWith('http') ? line : playlistBase + line);
          nextIsChunk = false;
        }
      }

      if (tsUrls.length === 0) {
        throw new Error('Video parts not directly enumerable in manifest.');
      }

      const buffers: ArrayBuffer[] = [];
      for (let i = 0; i < tsUrls.length; i++) {
        setDownloadStatusText(`Saving part ${i + 1} of ${tsUrls.length}...`);
        const segRes = await fetch(tsUrls[i]);
        if (!segRes.ok) throw new Error(`Segment ${i + 1} network interruption`);
        buffers.push(await segRes.arrayBuffer());
        setDownloadProgress(Math.round(((i + 1) / tsUrls.length) * 100));
      }

      setDownloadStatusText('Merging into MP4...');
      const blob = new Blob(buffers, { type: 'video/mp4' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${(media?.title || 'GB_STUDY_Lecture').replace(/[^a-z0-9]/gi, '_')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      setDownloadStatusText('Download complete!');
    } catch (err) {
      setDownloadStatusText(
        err instanceof Error ? `Download notice: ${err.message}` : 'Download completed'
      );
    } finally {
      setTimeout(() => {
        setDownloadingChunks(false);
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090B] flex flex-col overflow-y-auto">
      {/* Top Player Navigation Bar */}
      <header className="sticky top-0 z-30 h-16 bg-[#09090B]/95 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-[#141419] hover:bg-[#FACC15] hover:text-black border border-white/10 text-zinc-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course</span>
          </button>
          <div className="min-w-0 hidden sm:block">
            <p className="text-xs text-zinc-400 truncate">{courseTitle}</p>
            <p className="text-sm font-semibold text-white truncate">
              {media?.title || initialTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono text-zinc-400 hidden md:inline">
            GB STUDY PLAYER
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="w-10 h-10 text-[#FACC15] animate-spin mb-4" />
            <h2 className="text-base font-semibold text-white mb-1">
              Loading {initialType === 'pdf' ? 'PDF Study Notes' : 'Lecture Stream'}...
            </h2>
            <p className="text-xs text-zinc-400 max-w-sm">
              Connecting to GB STUDY content server for &ldquo;{initialTitle}&rdquo;
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">{initialTitle}</h2>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              This content could not be retrieved from the upstream server ({error}). No fake video
              or PDF has been substituted.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black font-semibold text-sm transition-colors cursor-pointer"
            >
              Return to Course Content
            </button>
          </div>
        )}

        {/* PDF Notes View */}
        {!loading && !error && media && media.mediaType === 'pdf' && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-[#121216] border border-white/[0.08] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                    <span className="text-red-400 font-medium">PDF Study Notes</span>
                    <span aria-hidden="true">·</span>
                    <span>{courseTitle}</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-white font-display">
                    {media.title}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <a
                  href={media.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Full PDF
                </a>
                <a
                  href={media.fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>

            {/* Viewer Mode Switcher & Mobile Notice */}
            <div className="bg-[#16161D] border border-white/[0.06] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-medium">Preview Mode:</span>
                <div className="flex items-center gap-1.5 bg-[#101015] p-1 rounded-lg border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setPdfViewMode('proxy')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      pdfViewMode === 'proxy'
                        ? 'bg-[#FACC15] text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    In-App Stream
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfViewMode('google')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      pdfViewMode === 'google'
                        ? 'bg-[#FACC15] text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Google Docs Viewer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfViewMode('direct')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      pdfViewMode === 'direct'
                        ? 'bg-[#FACC15] text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Direct CDN
                  </button>
                </div>
              </div>

              <div className="text-zinc-400 text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Mobile tip: Use &quot;Open Full PDF&quot; to view in Android PDF Reader</span>
              </div>
            </div>

            {/* Embedded PDF Reader */}
            <div className="flex-1 min-h-[68vh] bg-[#141418] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col relative shadow-2xl">
              <iframe
                src={
                  pdfViewMode === 'proxy'
                    ? media.streamUrl || media.fileUrl
                    : pdfViewMode === 'google'
                    ? `https://docs.google.com/viewer?url=${encodeURIComponent(media.fileUrl)}&embedded=true`
                    : media.fileUrl
                }
                title={media.title}
                className="w-full flex-1 min-h-[68vh] border-0 bg-white"
              />
            </div>
          </div>
        )}

        {/* YouTube Video View */}
        {!loading && !error && media && media.mediaType === 'youtube' && (
          <div className="flex flex-col gap-6">
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(media.fileUrl)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={media.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="bg-[#121216] border border-white/[0.08] rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                <span>YouTube Lecture</span>
                <span aria-hidden="true">·</span>
                <span>{courseTitle}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
                {media.title}
              </h1>
            </div>
          </div>
        )}

        {/* HLS / MP4 Video View */}
        {!loading &&
          !error &&
          media &&
          (media.mediaType === 'hls' || media.mediaType === 'mp4') && (
            <div className="flex flex-col gap-6">
              <div
                ref={playerContainerRef}
                className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative"
              >
                <video
                  ref={videoRef}
                  poster={media.thumbnail || undefined}
                  controls
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              </div>

              {/* Title & Custom Controls Deck */}
              <div className="bg-[#121216] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5">
                      <span>{media.isLive ? 'Live Stream' : 'Video Lecture'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{courseTitle}</span>
                    </div>
                    <h1 className="text-lg sm:text-2xl font-bold text-white font-display">
                      {media.title}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSkip(-10)}
                      className="px-3 py-2 rounded-xl bg-[#1A1A22] hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#FACC15]" />
                      -10s
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSkip(10)}
                      className="px-3 py-2 rounded-xl bg-[#1A1A22] hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-[#FACC15]" />
                      +10s
                    </button>
                    <button
                      type="button"
                      onClick={handleFullscreen}
                      className="px-3.5 py-2 rounded-xl bg-[#1A1A22] hover:bg-[#FACC15] hover:text-black border border-white/10 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Maximize className="w-3.5 h-3.5" />
                      Fullscreen
                    </button>
                  </div>
                </div>

                {/* Quality & Playback Speed & Download Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stream Quality Selector */}
                  <div>
                    <div className="text-xs font-semibold text-zinc-400 mb-2.5 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-[#FACC15]" />
                      <span>Stream Quality</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeStreamUrl.includes('.m3u8') ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleQualityChange(-1)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              selectedQuality === -1
                                ? 'bg-[#FACC15] text-black border-[#FACC15]'
                                : 'bg-[#18181F] text-zinc-300 border-white/10 hover:text-white'
                            }`}
                          >
                            Auto
                          </button>
                          {qualities.map((q) => (
                            <button
                              key={q.index}
                              type="button"
                              onClick={() => handleQualityChange(q.index)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                selectedQuality === q.index
                                  ? 'bg-[#FACC15] text-black border-[#FACC15]'
                                  : 'bg-[#18181F] text-zinc-300 border-white/10 hover:text-white'
                              }`}
                            >
                              {q.label}
                            </button>
                          ))}
                        </>
                      ) : (
                        <span className="text-xs text-[#FACC15] font-mono px-2 py-1 bg-[#18181F] rounded-md border border-white/10">
                          Direct MP4 Mode
                        </span>
                      )}

                      {/* Direct MP4 alternate stream buttons */}
                      {media.downloadUrls &&
                        media.downloadUrls.map((dl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSwitchToDirectMp4(dl.url)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              activeStreamUrl === dl.url
                                ? 'bg-[#FACC15] text-black border-[#FACC15]'
                                : 'bg-[#18181F] text-zinc-400 border-white/10 hover:text-white'
                            }`}
                          >
                            {dl.title} (Direct)
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Playback Speed */}
                  <div>
                    <div className="text-xs font-semibold text-zinc-400 mb-2.5 flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-[#FACC15]" />
                      <span>Playback Speed</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            playbackSpeed === spd
                              ? 'bg-[#FACC15] text-black border-[#FACC15]'
                              : 'bg-[#18181F] text-zinc-300 border-white/10 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save Lecture Offline */}
                  <div>
                    <div className="text-xs font-semibold text-zinc-400 mb-2.5 flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#FACC15]" />
                      <span>Download Video</span>
                    </div>
                    {media.downloadUrls && media.downloadUrls.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {media.downloadUrls.map((dl, idx) => (
                          <a
                            key={idx}
                            href={dl.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#18181F] hover:bg-[#FACC15] hover:text-black border border-white/10 text-zinc-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {dl.title}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <button
                          type="button"
                          disabled={downloadingChunks}
                          onClick={handleHlsStreamDownload}
                          className="px-4 py-2 rounded-xl bg-[#18181F] hover:bg-[#FACC15] hover:text-black disabled:opacity-50 border border-white/10 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {downloadingChunks
                            ? `Downloading (${downloadProgress}%)`
                            : 'Save Video File (.mp4)'}
                        </button>
                        {downloadStatusText && (
                          <p className="text-[11px] text-zinc-400 mt-1.5 font-mono">
                            {downloadStatusText}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
      </main>
    </div>
  );
};

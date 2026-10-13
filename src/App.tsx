import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  FileText,
  FolderOpen,
  History,
  LayoutGrid,
  Play,
  Search,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import {
  ALL_BATCHES,
  BatchItem,
  IndexedContentItem,
  SITE_CONFIG,
} from './data/batchesData';
import {
  DownloadQualityLink,
  formatDuration,
  formatTimestampDate,
  getGlobalIndexedContent,
} from './services/studyApi';
import { SmartThumbnail } from './components/SmartThumbnail';
import { TelegramModal } from './components/TelegramModal';
import { CourseDetailView } from './components/CourseDetailView';
import { MediaPlayerModal } from './components/MediaPlayerModal';

type BatchTab = 'new' | 'old' | 'all' | 'wishlist';
type CategoryFilter =
  | 'All'
  | 'Class 7'
  | 'Class 8'
  | 'Class 9'
  | 'Class 10'
  | 'Class 11'
  | 'Class 12'
  | 'CUET'
  | 'Olympiad & Camp';

interface ActiveMediaState {
  courseId: number;
  courseTitle: string;
  contentId: string;
  title: string;
  type: 'video' | 'pdf';
  downloadUrls?: DownloadQualityLink[];
  directUrl?: string;
}

const ITEMS_PER_PAGE = 12;

export function App() {
  const [telegramPopupOpen, setTelegramPopupOpen] = useState<boolean>(true);

  const [enrolledIds, setEnrolledIds] = useState<number[]>(() => {
    try {
      const saved =
        localStorage.getItem('gbstudy_enrolled') ||
        localStorage.getItem('studybee_wishlist');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.map((v) => Number(v)).filter((n) => !isNaN(n))
        : [];
    } catch {
      return [];
    }
  });

  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [initialFolderTarget, setInitialFolderTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [activeMedia, setActiveMedia] = useState<ActiveMediaState | null>(null);

  const [activeTab, setActiveTab] = useState<BatchTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const lecturesSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id') || params.get('courseId');
    if (idParam) {
      const numId = Number(idParam);
      if (!isNaN(numId) && ALL_BATCHES.some((b) => b.id === numId)) {
        setSelectedBatchId(numId);
      }
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const cId = p.get('id') || p.get('courseId');
      if (cId && !isNaN(Number(cId))) {
        setSelectedBatchId(Number(cId));
      } else {
        setSelectedBatchId(null);
      }
      setActiveMedia(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast.visible]);

  const handleToggleEnroll = (batchId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEnrolledIds((prev) => {
      const exists = prev.includes(batchId);
      const next = exists ? prev.filter((id) => id !== batchId) : [...prev, batchId];
      try {
        localStorage.setItem('gbstudy_enrolled', JSON.stringify(next));
        localStorage.setItem('studybee_wishlist', JSON.stringify(next.map(String)));
      } catch {
        // Storage quota
      }
      showToast(exists ? 'Removed from My Enrolled Batches' : 'Enrolled in batch!');
      return next;
    });
  };

  const handleOpenBatch = (
    batchId: number,
    folderTarget?: { id: string; title: string }
  ) => {
    setSelectedBatchId(batchId);
    setInitialFolderTarget(folderTarget || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('id', String(batchId));
      window.history.pushState({ batchId }, '', url.toString());
    } catch {
      // Sandboxed frame
    }
  };

  const handleBackToHome = () => {
    setSelectedBatchId(null);
    setInitialFolderTarget(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      url.searchParams.delete('courseId');
      window.history.pushState({}, '', url.toString());
    } catch {
      // Ignored
    }
  };

  const handleSwitchTab = (tab: BatchTab) => {
    setActiveTab(tab);
    setVisibleCount(ITEMS_PER_PAGE);
    if (selectedBatchId !== null) {
      handleBackToHome();
    }
  };

  const filteredBatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return ALL_BATCHES.filter((batch) => {
      if (!q) {
        if (activeTab === 'new' && batch.batchGroup !== 'new') return false;
        if (activeTab === 'old' && batch.batchGroup !== 'old') return false;
        if (activeTab === 'wishlist' && !enrolledIds.includes(batch.id)) return false;
      } else {
        if (activeTab === 'wishlist' && !enrolledIds.includes(batch.id)) return false;
      }

      if (selectedCategory !== 'All' && batch.category !== selectedCategory) {
        return false;
      }

      if (q) {
        const hay = `${batch.title} ${batch.category} ${batch.stream} ${batch.session} ${batch.id} ${batch.descriptionSummary}`.toLowerCase();
        return hay.includes(q);
      }

      return true;
    });
  }, [activeTab, selectedCategory, searchQuery, enrolledIds]);

  const matchingLecturesAndPdfs = useMemo<IndexedContentItem[]>(() => {
    const allIndexed = getGlobalIndexedContent();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allIndexed;
    return allIndexed.filter((item) => {
      const hay = `${item.title} ${item.subject} ${item.courseTitle} ${item.folderTitle} ${item.type}`.toLowerCase();
      return hay.includes(q);
    });
  }, [searchQuery, selectedBatchId, activeMedia]);

  const displayedBatches = useMemo(
    () => filteredBatches.slice(0, visibleCount),
    [filteredBatches, visibleCount]
  );

  const selectedBatch: BatchItem | undefined = useMemo(
    () => ALL_BATCHES.find((b) => b.id === selectedBatchId),
    [selectedBatchId]
  );

  const categories: CategoryFilter[] = [
    'All',
    'Class 7',
    'Class 8',
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
    'CUET',
    'Olympiad & Camp',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-[#F4F4F5]">
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#141419] border border-[#FACC15]/40 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-[#FACC15] shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Telegram Popup Modal */}
      <TelegramModal
        isOpen={telegramPopupOpen}
        onClose={() => setTelegramPopupOpen(false)}
      />

      {/* Media Player / PDF Reader Overlay */}
      {activeMedia && (
        <MediaPlayerModal
          courseId={activeMedia.courseId}
          courseTitle={activeMedia.courseTitle}
          contentId={activeMedia.contentId}
          initialTitle={activeMedia.title}
          initialType={activeMedia.type}
          initialDownloadUrls={activeMedia.downloadUrls}
          initialDirectUrl={activeMedia.directUrl}
          onClose={() => setActiveMedia(null)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 h-16 bg-[#09090B]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleBackToHome();
          }}
          className="text-xl font-extrabold tracking-tight text-white font-display whitespace-nowrap shrink-0 cursor-pointer"
        >
          GB <span className="text-[#FACC15]">STUDY</span>
        </a>

        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400"
        >
          <button
            type="button"
            onClick={() => handleSwitchTab('all')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
              selectedBatchId === null && activeTab === 'all'
                ? 'text-white border-[#FACC15]'
                : 'border-transparent'
            }`}
          >
            All Batches ({ALL_BATCHES.length})
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTab('new')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
              selectedBatchId === null && activeTab === 'new'
                ? 'text-white border-[#FACC15]'
                : 'border-transparent'
            }`}
          >
            Latest (26-27)
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTab('old')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
              selectedBatchId === null && activeTab === 'old'
                ? 'text-white border-[#FACC15]'
                : 'border-transparent'
            }`}
          >
            Archive (25-26)
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTab('wishlist')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
              selectedBatchId === null && activeTab === 'wishlist'
                ? 'text-white border-[#FACC15]'
                : 'border-transparent'
            }`}
          >
            My Enrolled ({enrolledIds.length})
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedBatchId !== null) {
                handleBackToHome();
              }
              setTimeout(() => {
                lecturesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 80);
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 border-transparent"
          >
            Lectures &amp; PDFs
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setTelegramPopupOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Join Telegram</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {selectedBatch ? (
          <CourseDetailView
            batch={selectedBatch}
            isEnrolled={enrolledIds.includes(selectedBatch.id)}
            onToggleEnroll={(id) => handleToggleEnroll(id)}
            onBackToHome={handleBackToHome}
            onOpenMedia={(mediaParams) => setActiveMedia(mediaParams)}
            initialFolderId={initialFolderTarget?.id}
            initialFolderTitle={initialFolderTarget?.title}
          />
        ) : (
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16 space-y-10">
            {/* Hero & Search */}
            <section className="bg-[#121216] border border-white/[0.08] rounded-2xl p-5 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-2">
                  <span className="text-[#FACC15] font-medium">GB STUDY Portal</span>
                  <span aria-hidden="true">·</span>
                  <span>Classes 7 to 12, CUET &amp; Olympiads</span>
                  <span aria-hidden="true">·</span>
                  <span>Direct Open Access</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight font-display mb-2.5 text-balance">
                  Explore Academic Batches, Video Lectures &amp; PDF Study Notes
                </h1>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Select your batch below to access structured chapter-wise video lectures, live
                  classes, daily practice papers (DPP), and downloadable PDF study notes.
                </p>
              </div>

              {/* Search Box */}
              <div className="w-full lg:w-[400px] shrink-0">
                <label htmlFor="global-search-input" className="sr-only">
                  Search batches, courses, lectures, or PDF notes
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="global-search-input"
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setVisibleCount(ITEMS_PER_PAGE);
                    }}
                    placeholder="Search batches, classes, lectures, PDFs..."
                    className="w-full bg-[#09090B] border border-white/15 focus:border-[#FACC15] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setVisibleCount(ITEMS_PER_PAGE);
                        searchInputRef.current?.focus();
                      }}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 px-1">
                  <span>
                    Showing {filteredBatches.length} batches &amp;{' '}
                    {matchingLecturesAndPdfs.length} indexed lectures/notes
                  </span>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-[#FACC15] hover:underline cursor-pointer"
                    >
                      Reset search
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Tabs & Class Filter Controls */}
            <section className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-[#121216] rounded-xl border border-white/[0.08] w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('all')}
                    className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-[#FACC15] text-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>All Batches ({ALL_BATCHES.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchTab('new')}
                    className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'new'
                        ? 'bg-[#FACC15] text-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Latest (2026-27)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchTab('old')}
                    className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'old'
                        ? 'bg-[#FACC15] text-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Old Archive (2025-26)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchTab('wishlist')}
                    className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'wishlist'
                        ? 'bg-[#FACC15] text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>My Enrolled ({enrolledIds.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setVisibleCount(ITEMS_PER_PAGE);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-white/15 text-white border-white/30 font-semibold'
                          : 'bg-[#121216] text-zinc-400 border-white/[0.06] hover:text-zinc-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Batches Grid */}
              {displayedBatches.length === 0 ? (
                <div className="bg-[#121216] border border-white/[0.08] rounded-2xl py-20 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-500 mb-4">
                    <FolderOpen className="w-7 h-7" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">No Batches Found</h2>
                  <p className="text-sm text-zinc-400 max-w-md mb-5">
                    {activeTab === 'wishlist'
                      ? 'You have not enrolled in any batches yet. Click "Enroll" on any batch card to bookmark it here.'
                      : 'No batches match your current search or class filter.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('all');
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#FACC15] text-black text-xs font-semibold cursor-pointer"
                  >
                    Show All Batches
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {displayedBatches.map((batch) => {
                      const isEnrolled = enrolledIds.includes(batch.id);

                      return (
                        <article
                          key={batch.id}
                          onClick={() => handleOpenBatch(batch.id)}
                          className="bg-[#121216] hover:bg-[#16161C] border border-white/[0.08] hover:border-[#FACC15]/40 rounded-2xl overflow-hidden flex flex-col group transition-all cursor-pointer"
                        >
                          <div className="relative w-full aspect-video bg-[#0B0B0E] border-b border-white/[0.06] overflow-hidden">
                            <SmartThumbnail
                              src={batch.thumbnail}
                              alt={batch.title}
                              fallbackType="batch"
                              subtitle={batch.category}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent opacity-85" />
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400 mb-2">
                                <span className="text-[#FACC15] font-medium">
                                  {batch.category}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{batch.session}</span>
                                <span aria-hidden="true">·</span>
                                <span>Free Access</span>
                              </div>

                              <h2 className="text-base font-bold text-zinc-100 group-hover:text-white leading-snug line-clamp-2 mb-2">
                                {batch.title}
                              </h2>

                              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                                {batch.descriptionSummary}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/[0.06]">
                              <button
                                type="button"
                                onClick={(e) => handleToggleEnroll(batch.id, e)}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                  isEnrolled
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                                }`}
                              >
                                {isEnrolled ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Enrolled</span>
                                  </>
                                ) : (
                                  <>
                                    <Bookmark className="w-3.5 h-3.5" />
                                    <span>Enroll</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenBatch(batch.id);
                                }}
                                className="px-4 py-2 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-black text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                <span>Let&apos;s Study</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {visibleCount < filteredBatches.length && (
                    <div className="flex justify-center pt-6">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                        className="px-7 py-2.5 rounded-xl bg-[#121216] hover:bg-[#1A1A22] border border-white/15 text-white font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span>
                          Load More Batches ({filteredBatches.length - visibleCount} remaining)
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#FACC15]" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Direct Lectures & PDF Notes Section */}
            <section
              ref={lecturesSectionRef}
              className="pt-6 border-t border-white/[0.08] space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                    <span className="text-[#FACC15] font-medium">Direct Study Access</span>
                    <span aria-hidden="true">·</span>
                    <span>Video Lectures &amp; Chapter PDF Notes</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                    {searchQuery
                      ? `Matching Lectures & PDF Notes (${matchingLecturesAndPdfs.length})`
                      : 'Recent Lectures & Chapter PDF Notes'}
                  </h2>
                </div>
                <p className="text-xs text-zinc-400">
                  Click any lecture to play or any PDF card to view and download notes.
                </p>
              </div>

              {matchingLecturesAndPdfs.length === 0 ? (
                <div className="bg-[#121216] border border-white/[0.06] rounded-2xl p-8 text-center">
                  <p className="text-sm text-zinc-400">
                    No indexed lectures or PDFs match &ldquo;{searchQuery}&rdquo;. Open any batch
                    above to browse all subject folders.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {matchingLecturesAndPdfs.slice(0, 12).map((item) => {
                    const dur = formatDuration(item.duration);
                    const dateStr = formatTimestampDate(item.createdAt);

                    return (
                      <div
                        key={`${item.courseId}-${item.entityId}`}
                        className="bg-[#121216] hover:bg-[#17171D] border border-white/[0.08] hover:border-[#FACC15]/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group"
                      >
                        {item.type === 'video' ? (
                          <div
                            onClick={() =>
                              setActiveMedia({
                                courseId: item.courseId,
                                courseTitle: item.courseTitle,
                                contentId: item.entityId,
                                title: item.title,
                                type: 'video',
                                downloadUrls: item.downloadUrls,
                                directUrl: item.directUrl,
                              })
                            }
                            className="relative aspect-video w-full bg-black border-b border-white/[0.06] overflow-hidden cursor-pointer"
                          >
                            <SmartThumbnail
                              src={item.thumbnail}
                              alt={item.title}
                              fallbackType="video"
                              subtitle={item.subject}
                              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-[#FACC15] text-black flex items-center justify-center shadow-lg">
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </div>
                            </div>
                            {dur && (
                              <span className="absolute bottom-2 right-2 text-[11px] font-mono bg-black/80 text-white px-2 py-0.5 rounded">
                                {dur}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              setActiveMedia({
                                courseId: item.courseId,
                                courseTitle: item.courseTitle,
                                contentId: item.entityId,
                                title: item.title,
                                type: 'pdf',
                                directUrl: item.directUrl,
                              })
                            }
                            className="relative h-32 w-full bg-gradient-to-br from-[#1C1417] via-[#131318] to-[#0D0D11] border-b border-white/[0.06] flex items-center justify-center cursor-pointer"
                          >
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                              <FileText className="w-6 h-6" />
                            </div>
                          </div>
                        )}

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                              <span
                                className={
                                  item.type === 'pdf'
                                    ? 'text-red-400 font-medium'
                                    : 'text-[#FACC15] font-medium'
                                }
                              >
                                {item.type === 'pdf' ? 'PDF Notes' : 'Video Lecture'}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="truncate">{item.subject}</span>
                              {dateStr && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{dateStr}</span>
                                </>
                              )}
                            </div>

                            <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                              {item.title}
                            </h3>
                            <p className="text-[11px] text-zinc-500 truncate mb-3">
                              {item.courseTitle}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMedia({
                                  courseId: item.courseId,
                                  courseTitle: item.courseTitle,
                                  contentId: item.entityId,
                                  title: item.title,
                                  type: item.type,
                                  downloadUrls: item.downloadUrls,
                                  directUrl: item.directUrl,
                                })
                              }
                              className="flex-1 py-2 px-3 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                              {item.type === 'pdf' ? (
                                <>
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Open PDF Notes</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>Play Lecture</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenBatch(item.courseId, {
                                  id: item.folderId,
                                  title: item.folderTitle,
                                })
                              }
                              className="py-2 px-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Folder
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#09090B] py-8 px-4 sm:px-6 mt-auto">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white font-display text-sm">
              GB <span className="text-[#FACC15]">STUDY</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Open Educational Batches, Video Lectures &amp; PDF Notes</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => handleSwitchTab('new')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Latest Batches
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('old')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Archive Batches
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('wishlist')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              My Enrolled
            </button>
            <a
              href={SITE_CONFIG.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FACC15] hover:underline font-medium flex items-center gap-1"
            >
              Telegram Channel
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

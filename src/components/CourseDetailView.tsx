import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Folder,
  Home,
  Info,
  Loader2,
  Play,
  Radio,
  Search,
  Video,
  X,
} from 'lucide-react';
import { BatchItem } from '../data/batchesData';
import {
  CourseContentItem,
  CourseOverviewData,
  DownloadQualityLink,
  fetchCourseOverview,
  fetchFolderContents,
  fetchLiveClasses,
  formatDuration,
  formatTimestampDate,
  LiveClassItem,
} from '../services/studyApi';
import { SmartThumbnail } from './SmartThumbnail';

interface CourseDetailViewProps {
  batch: BatchItem;
  isEnrolled: boolean;
  onToggleEnroll: (batchId: number) => void;
  onBackToHome: () => void;
  onOpenMedia: (params: {
    courseId: number;
    courseTitle: string;
    contentId: string;
    title: string;
    type: 'video' | 'pdf';
    downloadUrls?: DownloadQualityLink[];
    directUrl?: string;
  }) => void;
  initialFolderId?: string;
  initialFolderTitle?: string;
}

interface BreadcrumbEntry {
  id: string;
  title: string;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  batch,
  isEnrolled,
  onToggleEnroll,
  onBackToHome,
  onOpenMedia,
  initialFolderId = '0',
  initialFolderTitle = 'Course Content',
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'overview' | 'live'>('content');

  // Overview state
  const [overview, setOverview] = useState<CourseOverviewData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState<boolean>(true);

  // Folder & Content state
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([
    { id: '0', title: 'Course Content' },
  ]);
  const [folderItems, setFolderItems] = useState<CourseContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState<boolean>(true);
  const [contentError, setContentError] = useState<string | null>(null);
  const [contentFilter, setContentFilter] = useState<'all' | 'video' | 'pdf'>('all');
  const [folderSearch, setFolderSearch] = useState<string>('');

  // Live Classes state
  const [liveSubTab, setLiveSubTab] = useState<'LIVE' | 'UPCOMING' | 'COMPLETED'>('COMPLETED');
  const [liveItems, setLiveItems] = useState<LiveClassItem[]>([]);
  const [liveLoading, setLiveLoading] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // Video options modal state
  const [selectedVideoOptionItem, setSelectedVideoOptionItem] = useState<CourseContentItem | null>(
    null
  );

  // Test notice modal
  const [selectedTestItem, setSelectedTestItem] = useState<CourseContentItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    setOverviewLoading(true);
    fetchCourseOverview(batch.id)
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .finally(() => {
        if (!cancelled) setOverviewLoading(false);
      });

    if (initialFolderId && initialFolderId !== '0') {
      setBreadcrumbs([
        { id: '0', title: 'Course Content' },
        { id: initialFolderId, title: initialFolderTitle },
      ]);
      loadFolderData(initialFolderId, initialFolderTitle);
    } else {
      setBreadcrumbs([{ id: '0', title: 'Course Content' }]);
      loadFolderData('0', 'Course Content');
    }

    return () => {
      cancelled = true;
    };
  }, [batch.id, initialFolderId, initialFolderTitle]);

  const loadFolderData = async (folderId: string, folderTitle: string) => {
    setContentLoading(true);
    setContentError(null);
    setFolderSearch('');

    try {
      const items = await fetchFolderContents(batch.id, folderId, folderTitle);
      setFolderItems(items);
    } catch (err) {
      setContentError(
        err instanceof Error ? err.message : 'Unable to fetch folder contents.'
      );
      setFolderItems([]);
    } finally {
      setContentLoading(false);
    }
  };

  const handleNavigateFolder = (folderId: string, folderTitle: string) => {
    setBreadcrumbs((prev) => {
      const existingIdx = prev.findIndex((b) => b.id === folderId);
      if (existingIdx > -1) {
        return prev.slice(0, existingIdx + 1);
      }
      return [...prev, { id: folderId, title: folderTitle }];
    });
    loadFolderData(folderId, folderTitle);
  };

  const handleStepBackFolder = () => {
    if (breadcrumbs.length > 1) {
      const target = breadcrumbs[breadcrumbs.length - 2];
      handleNavigateFolder(target.id, target.title);
    } else {
      onBackToHome();
    }
  };

  useEffect(() => {
    if (activeTab !== 'live') return;
    let cancelled = false;
    setLiveLoading(true);
    setLiveError(null);

    fetchLiveClasses(batch.id, liveSubTab)
      .then((items) => {
        if (!cancelled) setLiveItems(items);
      })
      .catch((err) => {
        if (!cancelled) {
          setLiveError(
            err instanceof Error ? err.message : 'Failed to load classes from server.'
          );
          setLiveItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, liveSubTab, batch.id]);

  const filteredItems = useMemo(() => {
    const q = folderSearch.toLowerCase().trim();
    return folderItems.filter((item) => {
      if (contentFilter === 'video' && item.type !== 'video' && item.type !== 'folder') {
        return false;
      }
      if (contentFilter === 'pdf' && item.type !== 'pdf' && item.type !== 'folder') {
        return false;
      }
      if (q && !item.title.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [folderItems, contentFilter, folderSearch]);

  const videoCountInFolder = useMemo(
    () => folderItems.filter((i) => i.type === 'video').length,
    [folderItems]
  );
  const pdfCountInFolder = useMemo(
    () => folderItems.filter((i) => i.type === 'pdf').length,
    [folderItems]
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top Back & Batch Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleStepBackFolder}
            className="px-3.5 py-2 rounded-xl bg-[#121216] hover:bg-[#1A1A20] border border-white/10 text-zinc-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[#FACC15]" />
            <span>
              {breadcrumbs.length > 1 ? 'Previous Folder' : 'All Batches'}
            </span>
          </button>

          {breadcrumbs.length > 1 && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-3 py-2 rounded-xl bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              All Batches
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onToggleEnroll(batch.id)}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            isEnrolled
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
              : 'bg-[#FACC15] hover:bg-[#EAB308] text-black'
          }`}
        >
          {isEnrolled ? (
            <>
              <Check className="w-4 h-4" />
              <span>Enrolled in Batch</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              <span>Enroll Free</span>
            </>
          )}
        </button>
      </div>

      {/* Course Hero Header Banner */}
      <div className="bg-[#121216] border border-white/[0.08] rounded-2xl p-5 sm:p-7 mb-7 flex flex-col-reverse lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-2">
            <span className="text-[#FACC15] font-medium">{batch.category}</span>
            <span aria-hidden="true">·</span>
            <span>{batch.stream}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">Session {batch.session}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">Batch #{batch.id}</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight font-display mb-2.5 text-balance">
            {overview?.title || batch.title}
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
            {batch.descriptionSummary}
          </p>
        </div>

        <div className="w-full lg:w-[300px] aspect-video rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0D] shrink-0">
          <SmartThumbnail
            src={overview?.thumbnail || batch.thumbnail}
            alt={batch.title}
            fallbackType="batch"
            subtitle={batch.category}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] mb-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`pb-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'content'
                ? 'text-[#FACC15] border-[#FACC15]'
                : 'text-zinc-400 hover:text-white border-transparent'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Lectures &amp; Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'text-[#FACC15] border-[#FACC15]'
                : 'text-zinc-400 hover:text-white border-transparent'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Overview &amp; Timetable</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`pb-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'live'
                ? 'text-[#FACC15] border-[#FACC15]'
                : 'text-zinc-400 hover:text-white border-transparent'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Live &amp; Recent Classes</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: LECTURES, FOLDERS & PDF NOTES ==================== */}
      {activeTab === 'content' && (
        <div className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#121216] border border-white/[0.08] rounded-xl p-3.5">
            <nav
              aria-label="Folder breadcrumbs"
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs sm:text-sm py-1"
            >
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.id}>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => !isLast && handleNavigateFolder(crumb.id, crumb.title)}
                      className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                        isLast
                          ? 'text-white font-semibold cursor-default'
                          : 'text-zinc-400 hover:text-[#FACC15] cursor-pointer'
                      }`}
                    >
                      {idx === 0 && <Home className="w-3.5 h-3.5 text-[#FACC15]" />}
                      <span>{crumb.title}</span>
                    </button>
                    {!isLast && (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </nav>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {(videoCountInFolder > 0 || pdfCountInFolder > 0) && (
                <div className="flex items-center gap-1 p-1 bg-[#0B0B0E] rounded-lg border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setContentFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      contentFilter === 'all'
                        ? 'bg-[#FACC15] text-black font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    All ({folderItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentFilter('video')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      contentFilter === 'video'
                        ? 'bg-[#FACC15] text-black font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Lectures ({videoCountInFolder})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentFilter('pdf')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      contentFilter === 'pdf'
                        ? 'bg-[#FACC15] text-black font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Notes / PDF ({pdfCountInFolder})
                  </button>
                </div>
              )}

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={folderSearch}
                  onChange={(e) => setFolderSearch(e.target.value)}
                  placeholder="Filter in this folder..."
                  className="w-full bg-[#0B0B0E] border border-white/10 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FACC15]/60"
                />
                {folderSearch && (
                  <button
                    type="button"
                    onClick={() => setFolderSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {contentLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="w-8 h-8 text-[#FACC15] animate-spin mb-3" />
              <p className="text-sm font-medium text-zinc-300">Loading folder contents...</p>
            </div>
          )}

          {!contentLoading && contentError && (
            <div className="bg-[#121216] border border-white/10 rounded-2xl p-8 text-center max-w-md mx-auto my-8">
              <p className="text-sm text-zinc-300 mb-4">{contentError}</p>
              <button
                type="button"
                onClick={() => {
                  const current = breadcrumbs[breadcrumbs.length - 1];
                  loadFolderData(current.id, current.title);
                }}
                className="px-4 py-2 rounded-xl bg-[#FACC15] text-black text-xs font-semibold cursor-pointer"
              >
                Retry Loading
              </button>
            </div>
          )}

          {!contentLoading && !contentError && filteredItems.length === 0 && (
            <div className="bg-[#121216] border border-white/[0.06] rounded-2xl py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-500 mx-auto mb-3">
                <Folder className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">No Matching Content</h3>
              <p className="text-xs text-zinc-400">
                {folderSearch
                  ? 'No items match your filter query in this folder.'
                  : 'No lectures or notes have been uploaded to this folder yet.'}
              </p>
            </div>
          )}

          {!contentLoading && !contentError && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredItems.map((item) => {
                if (item.type === 'folder') {
                  const c = item.counts || { folders: 0, videos: 0, pdfs: 0, tests: 0 };
                  const summaryParts: string[] = [];
                  if (c.folders > 0) summaryParts.push(`${c.folders} Folders`);
                  if (c.videos > 0) summaryParts.push(`${c.videos} Lectures`);
                  if (c.pdfs > 0) summaryParts.push(`${c.pdfs} PDFs`);
                  if (c.tests > 0) summaryParts.push(`${c.tests} Tests`);
                  const summaryText =
                    summaryParts.length > 0 ? summaryParts.join(' · ') : 'Open Folder';

                  return (
                    <div
                      key={`folder-${item.entityId}`}
                      onClick={() => handleNavigateFolder(item.entityId, item.title)}
                      className="bg-[#121216] hover:bg-[#17171D] border border-white/[0.08] hover:border-[#FACC15]/40 rounded-2xl overflow-hidden cursor-pointer group flex flex-col transition-all"
                    >
                      <div className="relative h-36 w-full bg-[#16161C] border-b border-white/[0.06] overflow-hidden">
                        {item.thumbnail ? (
                          <SmartThumbnail
                            src={item.thumbnail}
                            alt={item.title}
                            fallbackType="folder"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#181820] to-[#101015]">
                            <Folder className="w-11 h-11 text-[#FACC15] group-hover:scale-110 transition-transform" />
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white line-clamp-2 leading-snug mb-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] font-mono text-zinc-400">
                          <span className="truncate">{summaryText}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#FACC15] shrink-0" />
                        </div>
                      </div>
                    </div>
                  );
                }

                if (item.type === 'video') {
                  const durText = formatDuration(item.durationSeconds);
                  const dateText = formatTimestampDate(item.createdAt);

                  return (
                    <div
                      key={`video-${item.entityId}`}
                      className="bg-[#121216] hover:bg-[#17171D] border border-white/[0.08] hover:border-[#FACC15]/40 rounded-2xl overflow-hidden group flex flex-col transition-all"
                    >
                      <div
                        onClick={() =>
                          onOpenMedia({
                            courseId: batch.id,
                            courseTitle: batch.title,
                            contentId: item.entityId,
                            title: item.title,
                            type: 'video',
                            downloadUrls: item.downloadUrls,
                            directUrl: item.fileUrl,
                          })
                        }
                        className="relative aspect-video w-full bg-[#0C0C0F] border-b border-white/[0.06] overflow-hidden cursor-pointer"
                      >
                        <SmartThumbnail
                          src={item.thumbnail}
                          alt={item.title}
                          fallbackType="video"
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-11 h-11 rounded-full bg-[#FACC15] text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>

                        {durText && (
                          <span className="absolute bottom-2.5 right-2.5 text-[11px] font-mono font-medium text-zinc-100 bg-black/80 px-2 py-0.5 rounded">
                            {durText}
                          </span>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                            <span className="text-[#FACC15] font-medium">
                              {item.isLive
                                ? 'Live Stream'
                                : item.isYouTube
                                ? 'YouTube'
                                : 'Video Lecture'}
                            </span>
                            {dateText && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{dateText}</span>
                              </>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-2 mb-3">
                            {item.title}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenMedia({
                                courseId: batch.id,
                                courseTitle: batch.title,
                                contentId: item.entityId,
                                title: item.title,
                                type: 'video',
                                downloadUrls: item.downloadUrls,
                                directUrl: item.fileUrl,
                              })
                            }
                            className="flex-1 py-2 px-3 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Watch Lecture
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedVideoOptionItem(item)}
                            title="Video Options & Download"
                            className="py-2 px-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (item.type === 'pdf') {
                  const dateText = formatTimestampDate(item.createdAt);

                  return (
                    <div
                      key={`pdf-${item.entityId}`}
                      onClick={() =>
                        onOpenMedia({
                          courseId: batch.id,
                          courseTitle: batch.title,
                          contentId: item.entityId,
                          title: item.title,
                          type: 'pdf',
                          directUrl: item.fileUrl,
                        })
                      }
                      className="bg-[#121216] hover:bg-[#17171D] border border-white/[0.08] hover:border-red-500/40 rounded-2xl overflow-hidden cursor-pointer group flex flex-col transition-all"
                    >
                      <div className="relative h-32 w-full bg-gradient-to-br from-[#1C1417] via-[#141418] to-[#0E0E12] border-b border-white/[0.06] flex flex-col items-center justify-center p-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                            <span className="text-red-400 font-medium">PDF Notes</span>
                            {dateText && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{dateText}</span>
                              </>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-2 mb-3">
                            {item.title}
                          </h3>
                        </div>

                        <div className="pt-3 border-t border-white/[0.06]">
                          <span className="w-full py-2 px-3 rounded-lg bg-white/[0.06] group-hover:bg-[#FACC15] group-hover:text-black text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap">
                            <FileText className="w-3.5 h-3.5" />
                            View &amp; Download PDF
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (item.type === 'test') {
                  return (
                    <div
                      key={`test-${item.entityId}`}
                      className="col-span-full bg-[#121216] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                          <span className="text-sky-400 font-medium">Practice Assessment</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">ID #{item.entityId}</span>
                        </div>
                        <h3 className="text-base font-semibold text-white truncate">
                          {item.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedTestItem(item)}
                        className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        View Assessment Info
                      </button>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: OVERVIEW & TIMETABLE ==================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {overviewLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#FACC15] animate-spin mb-3" />
              <p className="text-sm text-zinc-400">Loading course overview...</p>
            </div>
          ) : (
            <>
              {overview?.timetableHtml && (
                <div className="bg-[#121216] border border-[#FACC15]/25 rounded-2xl p-5 sm:p-7">
                  <div className="flex items-center gap-2.5 text-[#FACC15] font-bold text-base sm:text-lg mb-4 font-display">
                    <Calendar className="w-5 h-5" />
                    <h2>{overview.timetableTitle || 'Batch Schedule & Time Table'}</h2>
                  </div>
                  <div
                    className="prose prose-invert max-w-none text-sm text-zinc-300 leading-relaxed [&_img]:rounded-xl [&_img]:max-w-full [&_a]:text-[#FACC15]"
                    dangerouslySetInnerHTML={{ __html: overview.timetableHtml }}
                  />
                </div>
              )}

              <div className="bg-[#121216] border border-white/[0.08] rounded-2xl p-5 sm:p-7">
                <h2 className="text-base sm:text-lg font-bold text-white mb-4 font-display">
                  Batch Details &amp; Syllabus Information
                </h2>
                <div
                  className="prose prose-invert max-w-none text-sm text-zinc-300 leading-relaxed space-y-3 [&_img]:rounded-xl [&_img]:max-w-full [&_a]:text-[#FACC15]"
                  dangerouslySetInnerHTML={{
                    __html:
                      overview?.descriptionHtml ||
                      `<p>${batch.descriptionSummary}</p>`,
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* ==================== TAB 3: LIVE & RECORDED CLASSES ==================== */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 p-1.5 bg-[#121216] border border-white/[0.08] rounded-xl w-fit overflow-x-auto max-w-full">
            {(['LIVE', 'UPCOMING', 'COMPLETED'] as const).map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setLiveSubTab(sub)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  liveSubTab === sub
                    ? 'bg-[#FACC15] text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {sub === 'LIVE' && <Radio className="w-3.5 h-3.5" />}
                {sub === 'UPCOMING' && <Clock className="w-3.5 h-3.5" />}
                {sub === 'COMPLETED' && <Video className="w-3.5 h-3.5" />}
                <span>
                  {sub === 'LIVE'
                    ? 'Live Now'
                    : sub === 'UPCOMING'
                    ? 'Upcoming'
                    : 'Completed Classes'}
                </span>
              </button>
            ))}
          </div>

          {liveLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#FACC15] animate-spin mb-3" />
              <p className="text-sm text-zinc-400">Loading {liveSubTab.toLowerCase()} classes...</p>
            </div>
          )}

          {!liveLoading && liveError && (
            <div className="bg-[#121216] border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-sm text-zinc-400">{liveError}</p>
            </div>
          )}

          {!liveLoading && !liveError && liveItems.length === 0 && (
            <div className="bg-[#121216] border border-white/[0.06] rounded-2xl py-16 px-4 text-center">
              <Video className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                No {liveSubTab === 'LIVE' ? 'Active Live' : liveSubTab === 'UPCOMING' ? 'Upcoming' : 'Completed'} Classes
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {liveSubTab === 'LIVE'
                  ? 'There are no live broadcasts running right now. Switch to Completed Classes or Lectures & Notes to watch recorded lectures.'
                  : 'Check back soon or browse the Lectures & Notes tab for full chapter recordings.'}
              </p>
            </div>
          )}

          {!liveLoading && !liveError && liveItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {liveItems.map((cls) => {
                const dur = formatDuration(cls.durationSeconds);
                const dateStr = formatTimestampDate(cls.liveFrom);

                return (
                  <div
                    key={cls.id}
                    onClick={() =>
                      onOpenMedia({
                        courseId: batch.id,
                        courseTitle: batch.title,
                        contentId: cls.videoId,
                        title: cls.title,
                        type: 'video',
                      })
                    }
                    className="bg-[#121216] hover:bg-[#17171D] border border-white/[0.08] hover:border-[#FACC15]/40 rounded-2xl overflow-hidden cursor-pointer group flex flex-col transition-all"
                  >
                    <div className="relative aspect-video w-full bg-black border-b border-white/[0.06] overflow-hidden">
                      <SmartThumbnail
                        src={cls.thumbnail}
                        alt={cls.title}
                        fallbackType="video"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      {dur && (
                        <span className="absolute bottom-2.5 right-2.5 text-[11px] font-mono bg-black/80 text-white px-2 py-0.5 rounded">
                          {dur}
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                          <span className="text-[#FACC15] font-medium">{cls.liveStatus}</span>
                          {dateStr && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{dateStr}</span>
                            </>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-white line-clamp-2 mb-3">
                          {cls.title}
                        </h3>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06]">
                        <span className="w-full py-2 px-3 rounded-lg bg-[#FACC15] text-black font-semibold text-xs flex items-center justify-center gap-1.5">
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Watch Session
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Video Options & Download Modal */}
      {selectedVideoOptionItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-[#FACC15] font-medium mb-0.5">Lecture Options</p>
                <h3 className="text-base font-bold text-white line-clamp-2">
                  {selectedVideoOptionItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideoOptionItem(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  const item = selectedVideoOptionItem;
                  setSelectedVideoOptionItem(null);
                  onOpenMedia({
                    courseId: batch.id,
                    courseTitle: batch.title,
                    contentId: item.entityId,
                    title: item.title,
                    type: 'video',
                    downloadUrls: item.downloadUrls,
                    directUrl: item.fileUrl,
                  });
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Stream Lecture Online
              </button>

              {selectedVideoOptionItem.downloadUrls &&
              selectedVideoOptionItem.downloadUrls.length > 0 ? (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-zinc-400 mb-2.5">
                    Direct Video Qualities:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedVideoOptionItem.downloadUrls.map((dl, i) => (
                      <a
                        key={i}
                        href={dl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-lg bg-[#1A1A22] hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#FACC15]" />
                        {dl.title}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 text-center pt-2">
                  Launch the lecture in the player to save the complete video stream.
                </p>
              )}

              <button
                type="button"
                onClick={() => setSelectedVideoOptionItem(null)}
                className="w-full py-2 px-4 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Info Modal */}
      {selectedTestItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-sky-400 font-medium mb-0.5">
                  Assessment Details · ID #{selectedTestItem.entityId}
                </p>
                <h3 className="text-base font-bold text-white">{selectedTestItem.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTestItem(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              On the original website, live MCQ test submissions required an external account token.
              In accordance with GB STUDY&apos;s open-access policy (no login/signup), external test
              questions are marked for manual replacement if you wish to attach a custom quiz PDF.
            </p>

            {selectedTestItem.rawTestMeta?.syllabusUrl && (
              <a
                href={selectedTestItem.rawTestMeta.syllabusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mb-3 py-2.5 px-4 rounded-xl bg-[#FACC15] text-black font-semibold text-xs flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Syllabus PDF
              </a>
            )}

            <button
              type="button"
              onClick={() => setSelectedTestItem(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

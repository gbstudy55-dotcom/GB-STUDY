import { ALL_BATCHES, BatchItem, FEATURED_INDEXED_CONTENT, IndexedContentItem } from '../data/batchesData';

export interface CourseOverviewData {
  id: number;
  title: string;
  thumbnail: string;
  descriptionHtml: string;
  timetableTitle?: string;
  timetableHtml?: string;
}

export interface FolderCounts {
  folders: number;
  videos: number;
  pdfs: number;
  tests: number;
}

export interface DownloadQualityLink {
  title: string;
  url: string;
}

export interface CourseContentItem {
  type: 'folder' | 'video' | 'pdf' | 'test';
  entityId: string;
  courseId: string;
  parentId: string;
  title: string;
  thumbnail?: string;
  durationSeconds?: number;
  createdAt?: number;
  isLive?: boolean;
  isUpcoming?: boolean;
  isYouTube?: boolean;
  videoType?: number;
  vdcId?: string;
  fileUrl?: string;
  counts?: FolderCounts;
  downloadUrls?: DownloadQualityLink[];
  dynamicLink?: string;
  rawTestMeta?: {
    scheduleStartTime?: number;
    scheduleEndTime?: number;
    syllabusUrl?: string | null;
  };
}

export interface ResolvedMediaResult {
  contentId: string;
  courseId: string;
  title: string;
  fileUrl: string;
  streamUrl?: string; // Optional proxied PDF stream URL
  thumbnail: string;
  mediaType: 'hls' | 'mp4' | 'youtube' | 'pdf' | 'external';
  isLive: boolean;
  durationSeconds: number;
  downloadUrls: DownloadQualityLink[];
}

export interface LiveClassItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  liveFrom?: number;
  liveTo?: number;
  durationSeconds?: number;
  liveStatus: 'LIVE' | 'UPCOMING' | 'COMPLETED';
}

const runtimeIndexedMap = new Map<string, IndexedContentItem>();
FEATURED_INDEXED_CONTENT.forEach((item) => {
  runtimeIndexedMap.set(`${item.courseId}:${item.entityId}`, item);
});

export function getGlobalIndexedContent(): IndexedContentItem[] {
  return Array.from(runtimeIndexedMap.values());
}

function rebrandHtmlText(html: string): string {
  if (!html) return '';
  return html
    .replace(/Study\s*Bee\s*Pro/gi, 'GB STUDY')
    .replace(/Study\s*Bee/gi, 'GB STUDY')
    .replace(/STUDYBEE/gi, 'GB STUDY');
}

export function parseDownloadUrls(raw: unknown): DownloadQualityLink[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((entry) => entry && typeof entry.url === 'string' && entry.url.startsWith('http'))
      .map((entry) => ({
        title: String(entry.title || 'Auto').replace(/p$/i, '') + 'p',
        url: String(entry.url),
      }));
  }
  if (typeof raw !== 'string') return [];
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '""' || trimmed === 'null') return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => entry && typeof entry.url === 'string' && entry.url.startsWith('http'))
      .map((entry) => ({
        title: String(entry.title || 'Auto').replace(/p$/i, '') + 'p',
        url: String(entry.url),
      }));
  } catch {
    return [];
  }
}

export async function fetchCourseOverview(courseId: number): Promise<CourseOverviewData> {
  const fallbackBatch = ALL_BATCHES.find((b) => b.id === courseId);
  try {
    const res = await fetch(`/api/nig?overview=${courseId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json && json.success && Array.isArray(json.data)) {
      const overviewTab = json.data.find((d: { type?: string }) => d.type === 'overview');
      const detailsSection = overviewTab?.data?.find(
        (l: { layout_type?: string }) => l.layout_type === 'details'
      );
      const courseDetails = detailsSection?.layout_data?.[0];
      const extraTab = json.data.find((d: { type?: string }) => d.type === 'extra_overview');

      if (courseDetails) {
        return {
          id: courseId,
          title: rebrandHtmlText(courseDetails.title || fallbackBatch?.title || `Batch #${courseId}`),
          thumbnail: courseDetails.thumbnail || fallbackBatch?.thumbnail || '',
          descriptionHtml: rebrandHtmlText(
            courseDetails.description || `<p>${fallbackBatch?.descriptionSummary || 'Course syllabus and details.'}</p>`
          ),
          timetableTitle: extraTab?.title ? rebrandHtmlText(extraTab.title) : undefined,
          timetableHtml: extraTab?.description ? rebrandHtmlText(extraTab.description) : undefined,
        };
      }
    }
  } catch (err) {
    console.warn('Overview fetch fallback used:', err);
  }

  return {
    id: courseId,
    title: fallbackBatch?.title || `Batch #${courseId}`,
    thumbnail: fallbackBatch?.thumbnail || '',
    descriptionHtml: `<p>${
      fallbackBatch?.descriptionSummary ||
      'Structured academic batch with chapter-wise video lectures, live classes, and downloadable PDF notes.'
    }</p>`,
  };
}

export async function fetchFolderContents(
  courseId: number,
  folderId: string = '0',
  folderTitle: string = 'Course Content'
): Promise<CourseContentItem[]> {
  const res = await fetch(`/api/nig?content=${courseId}&folder=${encodeURIComponent(folderId)}`);
  if (!res.ok) {
    throw new Error(`Unable to load folder (${res.status})`);
  }
  const json = await res.json();
  if (!json || !json.success || !Array.isArray(json.data)) {
    return [];
  }

  const batchObj: BatchItem | undefined = ALL_BATCHES.find((b) => b.id === courseId);
  const courseTitle = batchObj?.title || `Batch #${courseId}`;

  const items: CourseContentItem[] = [];

  for (const raw of json.data) {
    const entityId = String(raw.entity_id ?? raw.data?.id ?? '');
    const title = rebrandHtmlText(String(raw.title ?? raw.data?.title ?? 'Untitled').trim());
    const parentId = String(raw.parent_id ?? folderId);

    if (raw.type === 'folder') {
      const counts = raw.data?.content_counts || {};
      const fCount = Number(counts.folders?.total || 0);
      const vCount = Number(counts.video?.paid || 0) + Number(counts.video?.free || 0);
      const pCount =
        Number(counts.pdf?.paid || 0) +
        Number(counts.pdf?.free || 0) +
        Number(counts.notes?.paid || 0) +
        Number(counts.notes?.free || 0);
      const tCount = Number(counts.test?.paid || 0) + Number(counts.test?.free || 0);

      items.push({
        type: 'folder',
        entityId,
        courseId: String(courseId),
        parentId,
        title,
        thumbnail: raw.data?.thumbnail?.trim() || undefined,
        counts: {
          folders: fCount,
          videos: vCount,
          pdfs: pCount,
          tests: tCount,
        },
      });
    } else if (raw.type === 'file') {
      const fileType = Number(raw.data?.file_type || 0);
      const videoType = Number(raw.data?.video_type || 0);
      const isVideo = fileType === 2 || videoType > 0;
      const durationSeconds = Number(raw.data?.duration || 0);
      const createdAt = Number(raw.data?.created_at || 0);
      const isLive = Number(raw.data?.is_live) === 1;
      const vdcId = String(raw.data?.vdc_id || '');
      const isUpcoming = isVideo && !isLive && durationSeconds === 0 && videoType !== 4 && !vdcId;
      const isYouTube = isVideo && !vdcId && videoType === 1;
      const downloadUrls = parseDownloadUrls(raw.data?.download_urls);
      const directFileUrl = typeof raw.data?.file_url === 'string' && raw.data.file_url.startsWith('http')
        ? raw.data.file_url
        : undefined;

      const contentItem: CourseContentItem = {
        type: isVideo ? 'video' : 'pdf',
        entityId,
        courseId: String(courseId),
        parentId,
        title,
        thumbnail: raw.data?.thumbnail?.trim() || undefined,
        durationSeconds,
        createdAt: createdAt > 0 ? createdAt : undefined,
        isLive,
        isUpcoming,
        isYouTube,
        videoType,
        vdcId,
        fileUrl: directFileUrl,
        downloadUrls,
        dynamicLink: raw.data?.dynamic_link || undefined,
      };

      items.push(contentItem);

      // Register in global runtime search index
      runtimeIndexedMap.set(`${courseId}:${entityId}`, {
        entityId,
        courseId,
        courseTitle,
        folderId,
        folderTitle,
        title,
        type: isVideo ? 'video' : 'pdf',
        subject: folderTitle,
        duration: durationSeconds,
        createdAt: createdAt > 0 ? createdAt : undefined,
        thumbnail: contentItem.thumbnail,
        directUrl: directFileUrl || (downloadUrls[0]?.url ?? undefined),
        downloadUrls,
      });
    } else if (raw.type === 'test') {
      items.push({
        type: 'test',
        entityId,
        courseId: String(courseId),
        parentId,
        title,
        rawTestMeta: {
          scheduleStartTime: Number(raw.data?.schedule_start_time || 0) || undefined,
          scheduleEndTime: Number(raw.data?.schedule_end_time || 0) || undefined,
          syllabusUrl: raw.data?.syllabus_url || null,
        },
      });
    }
  }

  return items;
}

function deepFindUrl(obj: unknown): string | null {
  if (!obj || typeof obj !== 'object') return null;
  const record = obj as Record<string, unknown>;
  const commonKeys = ['file_url', 'url', 'link', 'pdf_link', 'videoUrl', 'aws_url', 'pdf_url'];
  for (const key of commonKeys) {
    const val = record[key];
    if (typeof val === 'string' && val.trim().length > 5) {
      return val.trim();
    }
  }
  for (const key of Object.keys(record)) {
    const val = record[key];
    if (val && typeof val === 'object') {
      const found = deepFindUrl(val);
      if (found) return found;
    }
  }
  return null;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([^?&#]+)/
  );
  return match ? match[1] : null;
}

export async function resolveMediaContent(
  courseId: number | string,
  contentId: string,
  fallbackTitle?: string,
  existingDownloadUrls?: DownloadQualityLink[],
  existingDirectUrl?: string
): Promise<ResolvedMediaResult> {
  // If we already have a direct URL, use it immediately
  if (existingDirectUrl && existingDirectUrl.startsWith('http')) {
    const lower = existingDirectUrl.toLowerCase();
    const isPdf = lower.includes('.pdf');
    const isYt = lower.includes('youtube.com') || lower.includes('youtu.be');
    return {
      contentId: String(contentId),
      courseId: String(courseId),
      title: fallbackTitle || 'Content Item',
      fileUrl: existingDirectUrl,
      streamUrl: isPdf ? `/api/pdf-stream?url=${encodeURIComponent(existingDirectUrl)}` : undefined,
      thumbnail: '',
      mediaType: isPdf ? 'pdf' : isYt ? 'youtube' : lower.includes('.m3u8') ? 'hls' : 'mp4',
      isLive: false,
      durationSeconds: 0,
      downloadUrls: existingDownloadUrls || [],
    };
  }

  const endpoints = [
    `/api/god?content_id=${encodeURIComponent(contentId)}&course_id=${encodeURIComponent(String(courseId))}`,
    `/api/play?content_id=${encodeURIComponent(contentId)}&course_id=${encodeURIComponent(String(courseId))}`,
  ];

  let lastErr: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      const mediaData = result.decryptedData || result.data || {};
      const hasDrmDetails =
        result.drm_details &&
        result.drm_details.status === true &&
        result.drm_details.data?.link?.file_url;

      const finalUrl = hasDrmDetails
        ? String(result.drm_details.data.link.file_url)
        : String(mediaData.file_url || deepFindUrl(mediaData) || '');

      const parsedDownloads = parseDownloadUrls(mediaData.download_urls);
      const mergedDownloads =
        parsedDownloads.length > 0 ? parsedDownloads : existingDownloadUrls || [];

      const effectiveUrl = finalUrl || (mergedDownloads[0]?.url ?? '');
      if (!effectiveUrl) {
        throw new Error('Media URL not present in decrypted response');
      }

      const lower = effectiveUrl.toLowerCase();
      const fileType = Number(mediaData.file_type || 0);
      const videoType = Number(mediaData.video_type || 0);
      const isPdf = fileType === 1 || lower.includes('.pdf');
      const isYouTube =
        videoType === 1 ||
        lower.includes('youtube.com') ||
        lower.includes('youtu.be') ||
        (!lower.startsWith('http') && /^[a-zA-Z0-9_-]{11}$/.test(effectiveUrl));

      let mediaType: ResolvedMediaResult['mediaType'] = 'external';
      if (isPdf) {
        mediaType = 'pdf';
      } else if (isYouTube) {
        mediaType = 'youtube';
      } else if (lower.includes('.m3u8')) {
        mediaType = 'hls';
      } else if (lower.includes('.mp4') || lower.includes('/videos/download/')) {
        mediaType = 'mp4';
      }

      return {
        contentId: String(contentId),
        courseId: String(courseId),
        title: rebrandHtmlText(String(mediaData.title || fallbackTitle || 'Lecture Content')),
        fileUrl: effectiveUrl,
        streamUrl: isPdf ? `/api/pdf-stream?url=${encodeURIComponent(effectiveUrl)}` : undefined,
        thumbnail: String(mediaData.thumbnail || '').trim(),
        mediaType,
        isLive: Number(mediaData.is_live) === 1,
        durationSeconds: Number(mediaData.duration || 0),
        downloadUrls: mergedDownloads,
      };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
    }
  }

  // Fallback to pre-indexed cache
  const indexed = runtimeIndexedMap.get(`${courseId}:${contentId}`);
  if (indexed?.directUrl || (existingDownloadUrls && existingDownloadUrls.length > 0)) {
    const fallbackUrl = indexed?.directUrl || existingDownloadUrls![0].url;
    const isPdf = fallbackUrl.toLowerCase().includes('.pdf');
    return {
      contentId: String(contentId),
      courseId: String(courseId),
      title: fallbackTitle || indexed?.title || 'Course Content',
      fileUrl: fallbackUrl,
      streamUrl: isPdf ? `/api/pdf-stream?url=${encodeURIComponent(fallbackUrl)}` : undefined,
      thumbnail: indexed?.thumbnail || '',
      mediaType: isPdf ? 'pdf' : fallbackUrl.includes('.m3u8') ? 'hls' : 'mp4',
      isLive: false,
      durationSeconds: indexed?.duration || 0,
      downloadUrls: existingDownloadUrls || indexed?.downloadUrls || [],
    };
  }

  throw lastErr || new Error('Could not resolve media stream from server');
}

export async function fetchLiveClasses(
  courseId: number,
  tabType: 'LIVE' | 'UPCOMING' | 'COMPLETED'
): Promise<LiveClassItem[]> {
  let typeCode = '1';
  if (tabType === 'UPCOMING') typeCode = '0';
  if (tabType === 'COMPLETED') typeCode = '2';

  const res = await fetch(
    `/api/play?action=classes&type=${typeCode}&course_id=${encodeURIComponent(String(courseId))}`
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json = await res.json();
  const rawItems = Array.isArray(json?.data) ? json.data : [];

  return rawItems.map((item: Record<string, unknown>) => ({
    id: String(item.id ?? item.video_id ?? ''),
    videoId: String(item.video_id ?? item.id ?? ''),
    title: rebrandHtmlText(String(item.title || 'Live Class Session')),
    thumbnail: String(item.thumbnail || '').trim(),
    liveFrom: Number(item.live_from || 0) || undefined,
    liveTo: Number(item.live_to || 0) || undefined,
    durationSeconds: Number(item.duration || 0) || undefined,
    liveStatus: tabType,
  }));
}

export function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');
  return h > 0 ? `${h}:${mStr}:${sStr}` : `${mStr}:${sStr}`;
}

export function formatTimestampDate(unixSeconds?: number): string {
  if (!unixSeconds || isNaN(unixSeconds) || unixSeconds <= 0) return '';
  const date = new Date(unixSeconds * 1000);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

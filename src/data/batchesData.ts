export interface BatchItem {
  id: number;
  title: string;
  thumbnail: string;
  category: 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12' | 'CUET' | 'Olympiad & Camp';
  stream: string;
  session: '2026-27' | '2025-26';
  batchGroup: 'new' | 'old';
  descriptionSummary: string;
}

export interface IndexedContentItem {
  entityId: string;
  courseId: number;
  courseTitle: string;
  folderId: string;
  folderTitle: string;
  title: string;
  type: 'video' | 'pdf';
  subject: string;
  duration?: number;
  createdAt?: number;
  thumbnail?: string;
  directUrl?: string;
  downloadUrls?: Array<{ title: string; url: string }>;
}

export const SITE_CONFIG = {
  brandName: 'GB STUDY',
  brandTagline: 'Academic Batches, Video Lectures & Chapter Notes',
  telegramUrl: 'https://t.me/GBFreestudy',
  telegramPopupTitle: 'Join GB STUDY Telegram Channel',
  telegramPopupSubtitle:
    'Join our official Telegram channel to get all batch lectures, chapter-wise PDF notes, daily practice papers (DPP), and class schedules directly on Telegram.',
  fallbackCourseThumbnail:
    'https://decicqog4ulhy.cloudfront.net/0/admin_v2/uploads/courses/thumbnail/2671188_1_logo.jpg',
};

/**
 * Complete list of all 46 Batches:
 * - 27 Batches (2026-27 Session) from nt.studybeepro.site/batches.json
 * - 19 Batches (2025-26 Session) from old-nt.studybeepro.site/batches.json
 */
export const ALL_BATCHES: BatchItem[] = [
  // ================= 2026-27 SESSION BATCHES (27 BATCHES) =================
  {
    id: 176,
    title: 'AARAMBH 2.0 10th BATCH 26-27',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/356423_125_10th%20aarambh%202.0%20banner%20app%202.jpg',
    category: 'Class 10',
    stream: 'CBSE Board Foundation',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Full-year Class 10 preparation covering Science, Maths, Social Science, English, Hindi, Sanskrit, and IT & AI.',
  },
  {
    id: 178,
    title: 'AARAMBH 2.0 9th BATCH 26-27',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/4330317_125_9th%20aarambh%202.0%20banner%20app%202.jpg',
    category: 'Class 9',
    stream: 'CBSE Foundation',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Full-year Class 9 syllabus coverage with structured video lectures, chapter notes, and daily practice papers.',
  },
  {
    id: 179,
    title: 'AARAMBH 2.0 PLUS 9th BATCH 26-27',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/1219057_125_9th%20aarambh%202.0%20plus%20banner%20app.jpg',
    category: 'Class 9',
    stream: 'CBSE Foundation Plus',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 9 Plus batch with comprehensive subject lectures, problem-solving workshops, and revision sheets.',
  },
  {
    id: 197,
    title: 'NIRMAAN : Class 7',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/1228199_125_Class%207th%20Nirmann%20Prashant%20Sir%20Banners09-01.png',
    category: 'Class 7',
    stream: 'Middle School Foundation',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Concept foundation batch for Class 7 covering Science, Maths, Social Science, and English.',
  },
  {
    id: 228,
    title: 'NIRMAAN-Term-II-Class-7-lFoundation-Program',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/6967602_125_Class-7th-Nirmaan-Term-II-App-Banners09.jpg',
    category: 'Class 7',
    stream: 'Term-II Foundation',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Targeted Term-II curriculum program with chapter lectures and study notes for Class 7.',
  },
  {
    id: 177,
    title: 'NIRMAAN BATCH CLASS 8TH 2026-27',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/6956338_125_Nirbhay%20Batch%20Class%208th%20App%20Banners09.jpg',
    category: 'Class 8',
    stream: 'Middle School Foundation',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 8 complete academic session batch with concept video lectures and downloadable PDF notes.',
  },
  {
    id: 193,
    title: 'NIRMAAN 2.0 BATCH Class 8th',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/6292174_125_Nirmaan%202.0%20Batch%20Class%208th%20App%20Banners09.png',
    category: 'Class 8',
    stream: 'Foundation 2.0',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Nirmaan 2.0 structured batch for Class 8 with chapter-wise modules and exercise discussions.',
  },
  {
    id: 229,
    title: 'NIRMAAN Term II | Class 8 lFoundation Program',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/2612865_125_Class-8th-Nirmaan-Term-II-App-Banners09.jpg',
    category: 'Class 8',
    stream: 'Term-II Foundation',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 8 Term-II syllabus completion and exam revision program with notes.',
  },
  {
    id: 107,
    title: 'Science (PCMB) 11th - PRARAMBH 2.0  ( 2026-27 )',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/7450443_125_Science%20Prarambh%202.0%20Batch%20Class%2011th%20App%20Banners.jpg',
    category: 'Class 11',
    stream: 'Science (PCMB)',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 11 Science (Physics, Chemistry, Maths, Biology) complete syllabus batch with DPPs and notes.',
  },
  {
    id: 108,
    title: 'Commerce 11th - PRARAMBH 2.0 ( 2026-27 )',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/498047_125_Commerce%20Prarambh%202.0%20Batch%20Class%2011th%20App%20Banners.jpg',
    category: 'Class 11',
    stream: 'Commerce',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 11 Commerce batch covering Accountancy, Business Studies, Economics, and Applied Mathematics.',
  },
  {
    id: 109,
    title: 'Humanities 11th - PRARAMBH 2.0 ( 2026-27 )',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/6568182_125_Humanites%20Prarambh%202.0%20Batch%20Class%2011th%20App%20Banners.jpg',
    category: 'Class 11',
    stream: 'Humanities',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 11 Humanities batch with comprehensive coverage of History, Political Science, Geography, and Economics.',
  },
  {
    id: 112,
    title: 'Science (PCMB) 11th - PRARAMBH PLUS 2.0 ( 2026-27)',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/5976277_125_Science%20Prarambh%202.0%20Plus%20Batch%20Class%2011th%20App%20Banners.jpg',
    category: 'Class 11',
    stream: 'Science (PCMB) Plus',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 11 Science PCMB Plus program with advanced problem-solving, test discussions, and notes.',
  },
  {
    id: 110,
    title: 'Commerce 11th - PRARAMBH PLUS 2.0 ( 2026-27)',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/5668039_125_Commerce%20Prarambh%202.0%20Plus%20Batch%20Class%2011th%20App%20Banners.jpg',
    category: 'Class 11',
    stream: 'Commerce Plus',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 11 Commerce Plus batch with detailed concepts, practical accounting cases, and revision papers.',
  },
  {
    id: 111,
    title: 'Humanities 11th - PRARAMBH PLUS  2.0 ( 2026-27)',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/5345603_125_Humanities%20Prarambh%202.0%20Plus%20Batch%20Class%2011th%20App%20Banners.jpg',
    category: 'Class 11',
    stream: 'Humanities Plus',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 11 Humanities Plus batch with NCERT analysis, answer-writing sessions, and chapter notes.',
  },
  {
    id: 101,
    title: 'Commerce 12th - PRARAMBH 2.0 (2026-27)',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/379913_125_Commerce%20Prarambh%202.0%20Batch%20Class%2012th%20App%20Banners.jpg',
    category: 'Class 12',
    stream: 'Commerce',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 12 Board Commerce batch covering Accountancy, Economics, Business Studies, and Mathematics.',
  },
  {
    id: 103,
    title: 'Science (PCMB) 12th - PRARAMBH 2.0 (2026-27)',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/1153510_125_Science%20Prarambh%202.0%20Batch%20Class%2012th%20App%20Banners.jpg',
    category: 'Class 12',
    stream: 'Science (PCMB)',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 12 Board Science (PCMB) complete syllabus batch with numericals, derivations, and PYQ discussions.',
  },
  {
    id: 105,
    title: 'Humanities 12th - PRARAMBH 2.0 (2026-27)',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/7561991_125_Humanites%20Prarambh%202.0%20Batch%20Class%2012th%20App%20Banners.jpg',
    category: 'Class 12',
    stream: 'Humanities',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 12 Board Humanities batch with structured lectures, source analysis, and chapter notes.',
  },
  {
    id: 104,
    title: 'SCIENCE (PCMB) 12TH - PRARAMBH PRO 2026-27',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/1890800_125_Science%20Prarambh%20Batch%20Class%2012th%20PRO%20App%20Banners.jpg',
    category: 'Class 12',
    stream: 'Science Pro',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 12 Science Pro program combining Board mastery with entrance exam preparation.',
  },
  {
    id: 102,
    title: 'COMMERCE 12TH - PRARAMBH PRO 2026-27',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/7402116_125_Commerce%20Prarambh%20Batch%20Class%2012th%20PRO%20App%20Banners.jpg',
    category: 'Class 12',
    stream: 'Commerce Pro',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 12 Commerce Pro batch with board examination preparation and competitive modules.',
  },
  {
    id: 106,
    title: 'HUMANITIES 12TH - PRARAMBH PRO 2026-27',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/3207649_125_IMG_5291.jpeg',
    category: 'Class 12',
    stream: 'Humanities Pro',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Class 12 Humanities Pro program with intensive answer-writing practice and CUET foundation.',
  },
  {
    id: 122,
    title: 'CUET (SCIENCE) 2026-27',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/346473_125_Science%20CUET%20Batch%20Class%2012th%20PRO%20App%20Banners.jpg',
    category: 'CUET',
    stream: 'CUET Science Domain',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'CUET 2026-27 preparation for Science domain subjects, General Test, and English language.',
  },
  {
    id: 123,
    title: 'CUET (HUMANITIES) 2026-27',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/6877813_125_Humanities%20CUET%20Batch%20Class%2012th%20PRO%20App%20Banners.jpg',
    category: 'CUET',
    stream: 'CUET Humanities Domain',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'CUET 2026-27 preparation for Humanities domain subjects, General Test, and Language.',
  },
  {
    id: 124,
    title: 'CUET (COMMERCE) 2026-27',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/721208_125_Commerce%20CUET%20Batch%20Class%2012th%20PRO%20App%20Banners.jpg',
    category: 'CUET',
    stream: 'CUET Commerce Domain',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'CUET 2026-27 preparation for Commerce domain subjects, General Test, and Language.',
  },
  {
    id: 183,
    title: 'NIRMAAN Summer Camp 2026',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/1583344_125_Nirmaan%20Summer%20Camp%20App%20Banners09%20%281%29.jpg',
    category: 'Olympiad & Camp',
    stream: 'Skill Camp',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Nirmaan Summer Camp interactive workshops on logic, science experiments, and foundational learning.',
  },
  {
    id: 190,
    title: 'IOQM - CRASH COURSE',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/3074115_125_Olympaid%20IOQM%20App%20Banners09.png',
    category: 'Olympiad & Camp',
    stream: 'Maths Olympiad',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Indian Olympiad Qualifier in Mathematics (IOQM) crash course with advanced problem techniques.',
  },
  {
    id: 191,
    title: 'NSEJS + SEHSS CRASH COURSE',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/7402474_125_Olympaid%20NSEJS%2BSEHSS%20App%20Banners09.png',
    category: 'Olympiad & Camp',
    stream: 'Junior Science Olympiad',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'National Standard Examination in Junior Science (NSEJS) and SEHSS crash course with notes.',
  },
  {
    id: 192,
    title: 'IOQM + NSEJS + SEHSS (CRASH COURSE)',
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/7718044_125_Olympaid%20Combo%20App%20Banners09%20%281%29.png',
    category: 'Olympiad & Camp',
    stream: 'Combined Olympiad Prep',
    session: '2026-27',
    batchGroup: 'new',
    descriptionSummary: 'Combined Olympiad preparation crash course covering IOQM, NSEJS, and SEHSS syllabus.',
  },

  // ================= 2025-26 ARCHIVE BATCHES (19 BATCHES) =================
  {
    id: 62,
    title: 'AARAMBH 2.0 10TH BATCH 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/285939929246_10th%20aarambh%202.0%20banner%20app.jpg',
    category: 'Class 10',
    stream: 'CBSE Board Archive',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Complete 2025-26 Class 10 archive with recorded lectures, chapter PDF notes, and DPP sheets.',
  },
  {
    id: 64,
    title: 'AARAMBH 2.0 9TH BATCH 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/152792333113_9th%20aarambh%202.0%20banner%20app.jpg',
    category: 'Class 9',
    stream: 'CBSE Foundation Archive',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Complete 2025-26 Class 9 archive with full video lectures, revision chapters, and PDF notes.',
  },
  {
    id: 78,
    title: 'ABHAY 10TH BATCH 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/626308539904_abhay%2010th%20banner%20app%202026.png',
    category: 'Class 10',
    stream: 'Board Crash Course',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Abhay Class 10 rapid board exam crash course with high-yield revision lectures and notes.',
  },
  {
    id: 81,
    title: 'ABHAY 9TH BATCH 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/151836440589_abhay%209th%20banner%20app%202026.png',
    category: 'Class 9',
    stream: 'Annual Exam Crash Course',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Abhay Class 9 intensive annual exam revision crash course with chapter summaries.',
  },
  {
    id: 85,
    title: 'SCIENCE 11TH (PCMB) - NIRBHAY 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/443372940688_Nirbhay%20Class%2011th%20Science.jpg',
    category: 'Class 11',
    stream: 'Science (PCMB) Revision',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Nirbhay Class 11 Science (PCMB) fast-track revision batch with complete recorded classes.',
  },
  {
    id: 86,
    title: 'SCIENCE 12TH (PCMB) - NIRBHAY 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/194079640690_Nirbhay%20Class%2012th%20Science.jpg',
    category: 'Class 12',
    stream: 'Science (PCMB) Revision',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Nirbhay Class 12 Science (PCMB) board exam revision lectures and chapter PDF notes.',
  },
  {
    id: 87,
    title: 'HUMANITIES 11TH - NIRBHAY 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/552700840691_Nirbhay%20Class%2011th%20Humanities.jpg',
    category: 'Class 11',
    stream: 'Humanities Revision',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Nirbhay Class 11 Humanities revision batch with full recorded sessions and notes.',
  },
  {
    id: 88,
    title: 'HUMANITIES 12TH - NIRBHAY 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/547817640692_Nirbhay%20Class%2012th%20Humanities.jpg',
    category: 'Class 12',
    stream: 'Humanities Revision',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Nirbhay Class 12 Humanities board examination revision batch and study notes.',
  },
  {
    id: 89,
    title: 'COMMERCE 11TH - NIRBHAY 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/782676440693_Nirbhay%20Class%2011th%20Commerce.jpg',
    category: 'Class 11',
    stream: 'Commerce Revision',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Nirbhay Class 11 Commerce revision batch with lectures and accounts solutions.',
  },
  {
    id: 90,
    title: 'COMMERCE 12TH - NIRBHAY 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/637993340694_Nirbhay%20Class%2012th%20Commerce.jpg',
    category: 'Class 12',
    stream: 'Commerce Revision',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Nirbhay Class 12 Commerce board exam revision batch with chapter-wise notes.',
  },
  {
    id: 91,
    title: 'COMMERCE NIRBHAY PRO 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/770214940695_WhatsApp%20Image%202025-11-23%20at%2018.46.10.jpeg',
    category: 'Class 12',
    stream: 'Commerce Pro Archive',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Nirbhay Pro Commerce 2025-26 full recorded course archive.',
  },
  {
    id: 92,
    title: 'SCIENCE NIRBHAY PRO 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/466570440696_Nirbhay%20Science%20CUET09.jpg',
    category: 'Class 12',
    stream: 'Science Pro Archive',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Nirbhay Pro Science & CUET 2025-26 complete recorded archive.',
  },
  {
    id: 93,
    title: 'HUMANITIES NIRBHAY PRO 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/110723540697_Prarambh%20BATCh%20Humanites09.jpg',
    category: 'Class 12',
    stream: 'Humanities Pro Archive',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Nirbhay Pro Humanities 2025-26 complete recorded course archive.',
  },
  {
    id: 53,
    title: 'PRARAMBH HUMANITIES 11TH 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/216113028517_Prarambh%20BATCh%20Humanities%2011.png',
    category: 'Class 11',
    stream: 'Humanities Archive',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Prarambh Class 11 Humanities 2025-26 full recorded curriculum archive.',
  },
  {
    id: 55,
    title: 'PRARAMBH SCIENCE 11TH (PCMB) 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/183130728609_Prarambh%20BATCh%20Science%20Class%2011.png',
    category: 'Class 11',
    stream: 'Science (PCMB) Archive',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Prarambh Class 11 Science (PCMB) 2025-26 full recorded curriculum archive.',
  },
  {
    id: 56,
    title: 'PRARAMBH COMMERCE 11TH 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/737975028610_Prarambh%20BATCh%20Commerce%2011.png',
    category: 'Class 11',
    stream: 'Commerce Archive',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Prarambh Class 11 Commerce 2025-26 full recorded curriculum archive.',
  },
  {
    id: 58,
    title: 'PRARAMBH SCIENCE 12TH (PCMB) 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/337551428612_Prarambh%20BATCh%20Science%2012.jpg',
    category: 'Class 12',
    stream: 'Science (PCMB) Archive',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Prarambh Class 12 Science (PCMB) 2025-26 full recorded curriculum archive.',
  },
  {
    id: 57,
    title: 'PRARAMBH COMMERCE 12TH 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/677190628611_Prarambh%20BATCh%20Commerce%2012.jpg',
    category: 'Class 12',
    stream: 'Commerce Archive',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Prarambh Class 12 Commerce 2025-26 full recorded curriculum archive.',
  },
  {
    id: 59,
    title: 'PRARAMBH HUMANITIES 12TH 2025-26',
    thumbnail:
      'https://dxixtlyravvxx.cloudfront.net/540/admin_v1/bundle_management/course/205624828613_Prarambh%20BATCh%20Humanities%2012.jpg',
    category: 'Class 12',
    stream: 'Humanities Archive',
    session: '2025-26',
    batchGroup: 'old',
    descriptionSummary: 'Prarambh Class 12 Humanities 2025-26 full recorded curriculum archive.',
  },
];

/**
 * Pre-indexed verified lectures & PDFs from both 2026-27 and 2025-26 batches
 * with direct CloudFront MP4/HLS streams and PDF URLs.
 */
export const FEATURED_INDEXED_CONTENT: IndexedContentItem[] = [
  {
    entityId: '30889',
    courseId: 176,
    courseTitle: 'AARAMBH 2.0 10th BATCH 26-27',
    folderId: '7102',
    folderTitle: 'Science / Lectures',
    title: 'Carbon and its Compounds L7',
    type: 'video',
    subject: 'Science',
    duration: 3921,
    createdAt: 1791717178,
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/content/thumbnail/2275557_148_Screenshot%202026-10-11%20120151.png',
    directUrl:
      'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4899743/1791722043_6005611278632231/179172110420998210315_360',
    downloadUrls: [
      {
        title: '240p',
        url: 'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4899743/1791722043_6005611278632231/179172110420998210315_240',
      },
      {
        title: '360p',
        url: 'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4899743/1791722043_6005611278632231/179172110420998210315_360',
      },
      {
        title: '480p',
        url: 'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4899743/1791722043_6005611278632231/179172110420998210315_480',
      },
      {
        title: '720p',
        url: 'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4899743/1791722043_6005611278632231/179172110420998210315_720',
      },
    ],
  },
  {
    entityId: '30906',
    courseId: 176,
    courseTitle: 'AARAMBH 2.0 10th BATCH 26-27',
    folderId: '7101',
    folderTitle: 'Science / Notes',
    title: "Carbon and its Compounds L7 (Class Notes PDF)",
    type: 'pdf',
    subject: 'Science',
    createdAt: 1791734062,
    directUrl: 'https://dxixtlyravvxx.cloudfront.net/540admin_v1/file_manager/pdf/167869385631024640.pdf',
  },
  {
    entityId: '30886',
    courseId: 176,
    courseTitle: 'AARAMBH 2.0 10th BATCH 26-27',
    folderId: '7101',
    folderTitle: 'Science / Notes',
    title: 'Carbon and its Compounds L6 (Class Notes PDF)',
    type: 'pdf',
    subject: 'Science',
    createdAt: 1791696463,
  },
  {
    entityId: '30990',
    courseId: 176,
    courseTitle: 'AARAMBH 2.0 10th BATCH 26-27',
    folderId: '6945',
    folderTitle: 'Maths / Lectures',
    title: 'Circles | L1',
    type: 'video',
    subject: 'Mathematics',
    duration: 4376,
    createdAt: 1791816306,
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/content/thumbnail/2854934_148_App%20Thumbnails%202026%20%2823%29.png',
  },
  {
    entityId: '31150',
    courseId: 176,
    courseTitle: 'AARAMBH 2.0 10th BATCH 26-27',
    folderId: '6945',
    folderTitle: 'Maths / Lectures',
    title: 'Circles | L2',
    type: 'video',
    subject: 'Mathematics',
    duration: 3600,
    createdAt: 1791901800,
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/content/thumbnail/1776824_148_App%20Thumbnails%202026%20%281%29.png',
  },
  {
    entityId: '31149',
    courseId: 176,
    courseTitle: 'AARAMBH 2.0 10th BATCH 26-27',
    folderId: '8183',
    folderTitle: 'Social Science / Lectures',
    title: 'Minerals and Energy Resource | L2',
    type: 'video',
    subject: 'Social Science',
    duration: 3840,
    createdAt: 1791891350,
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/content/thumbnail/7245846_148_App%20Thumbnails%202026.png',
  },
  {
    entityId: '29529',
    courseId: 176,
    courseTitle: 'AARAMBH 2.0 10th BATCH 26-27',
    folderId: '20039',
    folderTitle: 'Next Chapter Talks',
    title: 'Next Chapter | Talks Ep:3',
    type: 'video',
    subject: 'Mentorship',
    duration: 2702,
    createdAt: 1790491268,
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/content/thumbnail/150912_125_01.png',
    directUrl:
      'https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/4883161/179049400938441304992/179049400938441304992_1304992.m3u8',
  },
  {
    entityId: '22033',
    courseId: 176,
    courseTitle: 'AARAMBH 2.0 10th BATCH 26-27',
    folderId: '0',
    folderTitle: 'Hindi Grammar',
    title: 'रचना के आधार पर वाक्य भेद, पदबंध (Video Lecture)',
    type: 'video',
    subject: 'Hindi',
    duration: 3976,
    createdAt: 1784385042,
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/content/thumbnail/2486438_148_App%20Thumbnails%202026.jpg',
  },
  {
    entityId: '22061',
    courseId: 176,
    courseTitle: 'AARAMBH 2.0 10th BATCH 26-27',
    folderId: '0',
    folderTitle: 'Hindi Grammar Notes',
    title: 'रचना के आधार पर वाक्य भेद, पदबंध (PDF Notes)',
    type: 'pdf',
    subject: 'Hindi',
    createdAt: 1784389345,
  },
  {
    entityId: '10437',
    courseId: 62,
    courseTitle: 'AARAMBH 2.0 10TH BATCH 2025-26',
    folderId: '2592',
    folderTitle: 'Maths / Lectures',
    title: 'Probability L3 (Video Lecture)',
    type: 'video',
    subject: 'Mathematics',
    duration: 3420,
    createdAt: 1771322301,
    thumbnail:
      'https://d2s4bvj9txf5k0.cloudfront.net/540/admin_v1/file_manager/videos/17276662363191_Science%20Stream%20%2836%29.png',
    directUrl:
      'https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/4590192/176201099079008752407/176201099079008752407_8752407.m3u8',
  },
  {
    entityId: '10450',
    courseId: 62,
    courseTitle: 'AARAMBH 2.0 10TH BATCH 2025-26',
    folderId: '2593',
    folderTitle: 'Maths / Notes',
    title: 'Probability L3 (PDF Notes)',
    type: 'pdf',
    subject: 'Mathematics',
    createdAt: 1771322304,
    directUrl:
      'https://dxixtlyravvxx.cloudfront.net/540admin_v1/file_manager/pdf/167869385631024640.pdf',
  },
  {
    entityId: '10422',
    courseId: 62,
    courseTitle: 'AARAMBH 2.0 10TH BATCH 2025-26',
    folderId: '2593',
    folderTitle: 'Maths / Notes',
    title: 'Probability L2 (PDF Notes)',
    type: 'pdf',
    subject: 'Mathematics',
    createdAt: 1771322304,
  },
];
